const { query } = require("express");
const express = require("express");
const jwt = require('jsonwebtoken');
const pool = require("../connection")
const {Pool} = require("pg");
const { database } = require("../credentials");

module.exports = {
    cart: async (req, res) => {
        
        
        const cart=req.body.cart
        const cupao_id = parseInt(req.body.cupao_id)
        const tokenheader = req.headers.authorization 
        var version
        var order_id
        
        tokeninfo = jwt.verify(tokenheader, '123456')
       


        //procura o nome do user do token na tabela de compradores para ver se é um comprador
        try {
            line = await pool.query('SELECT users_username FROM comprador WHERE users_username = $1',[tokeninfo.username])
            
            
        } catch (error) {
            throw(error)
        }
        if (line.rows[0] === undefined){
            return res.status(400).json( {"status" :400 , "errors": "utilizador nao autorizado"})
        }
        
        let max_order=await pool.query('SELECT max(order_id) FROM cart')
            
            
            if(max_order.rows[0].max === null){
                order_id=1
            }
            else{
                
                order_id=parseInt(max_order.rows[0].max)+1
            }
            
        try {     
            await pool.query('BEGIN')
            for (let i = 0; i < cart.length; i++) {
                let line
                let preco_total
                  
                //vai buscar o stock de um certo produto
                let quantidade = await pool.query('select stock_produto from produtos where produto_id = $1',[cart[i][0]])
                
                if (quantidade.rows[0].stock_produto === 0) {
                    throw new Error('Produto sem estoque')
                }
                
                //vai buscar todos o produto com o id recebido
                line = await pool.query('select * from produtos where produto_id=$1',[cart[i][0]])
                
                    if(line.rows[0] === undefined){
                            
                        return res.status(400).json({"status":400 , "errors": "produto nao existe"})  
                    }
                    
                    else{
                        
                        //vai buscar o preço dos produtos
                        let precos= await pool.query('select preco from produtos where produto_id=$1',[cart[i][0]])
                        
                        preco_total =preco_total + (parseInt(precos.rows[0].preco) * cart[i][1])
    
                        //guarda a maior versao ja dada na versao atualiza para uma nova inserçao
                        let max_ver= await pool.query('select MAX(version) from versao_produto where produtos_produto_id=$1',[cart[i][0]])
                        
                        if(max_ver.rows[0].max === null){
                            version = 1
                            
                        }    
                        else{
                            
                            version = 1 + parseInt(max_ver.rows[0].max) 
                        }    
                        //guarda a data de hoje
                        let date = new Date()
                        const dia = date.getDate()
                        const mes = date.getMonth() + 1
                        const ano = date.getFullYear()
                        const data = dia.toString() + '-' + mes.toString() + '-' + ano.toString()
                        
                        //insere a compra no carrinho e guarda a versao do produto
                        
                        await pool.query('INSERT INTO versao_produto(nome,preco,stock,version,descricao,creation_date,produtos_produto_id) VALUES($1,$2,$3,$4,$5,$6,$7)',
                        [line.rows[0].nome,line.rows[0].preco,line.rows[0].stock_produto,version,line.rows[0].descricao,data,cart[i][0]])
                        console.log(cart[i][1],order_id,cart[i][0],tokeninfo.username,data)
                        await pool.query('insert into cart (quantidade,order_id,produtos_produto_id,comprador_users_username,data) values ($1,$2,$3,$4,$5)',[cart[i][1],order_id,cart[i][0],tokeninfo.username,data])
                        
                        await pool.query('DELETE FROM subscricoes WHERE comprador_users_username = $1 AND cupao_id_cupao = $2', [tokeninfo.username,cupao_id])
                        
                    }
                                        
                    
                    await pool.query('update produtos set stock_produto = stock_produto - $1 where produto_id = $2;',[cart[i][1],cart[i][0]])
                    
    
                }
                await pool.query('COMMIT')
                return res.status(200).json({"status":200,'order_id':order_id})
            
          } catch (e) {
          
        
            await pool.query('ROLLBACK')
            
            return res.status(400).json({"status":400,"errors":e.message})
            }
        
    },
    

    criar_novo_produto: async (req, res) => {
        const type = req.body.type
        const empresa_id= parseInt(req.body.empresa_id)
        const nome = req.body.nome
        const descricao = req.body.descricao
        const preco = parseInt(req.body.preco)
        const stock = parseInt(req.body.stock)
        const tokenheader = req.headers.authorization 
        

        tokeninfo = jwt.verify(tokenheader, '123456')
        
        let line
        try {
            line = await pool.query('SELECT users_username FROM vendedor WHERE users_username = $1',[tokeninfo.username])
            
        } catch (error) {
            throw(error)
        }
        if (line.rows[0] === undefined){
            return res.status(400).json({"status": 400 , "errors": "utilizador nao autorizado"})
        }
        
        let result= await pool.query('INSERT INTO produtos (nome,preco, descricao,stock_produto,empresas_empresa_id) VALUES ($1, $2, $3, $4,$5) RETURNING (produto_id)', [ nome, preco, descricao,stock,empresa_id])
        
        if (type === "smartphone") {
            try {
                await pool.query('BEGIN')
                const marca = req.body.marca
                if (marca === undefined) {
                    return res.status(400).json({ "status": 400, "errors": "marca nao definida" })
                }
                    
                await pool.query('INSERT INTO smartphones(marca,produtos_produto_id) VALUES($1,$2)', [marca, result.rows[0].produto_id])
                await pool.query('COMMIT')
                return res.status(200).json({"status":200, "results":result.rows[0].produto_id})
  
                
            } catch (error) {
                await pool.quer('ROLLBACK')
                throw error
            }
            
        }
        else if (type === "televisao") {
            try{
                await pool.query('BEGIN')
                const dimensao = req.body.dimensao
                if (dimensao === undefined) {
                    return res.status(400).json()
                }
                   
                await pool.query('INSERT INTO televisoes(dimensao,produtos_produto_id ) VALUES($1,$2)', [dimensao,result.rows[0].produto_id])
                await pool.query('COMMIT')
                return res.status(200).json({"status":200, "results":result.rows[0].produto_id})
                
            } catch (error) {
                await pool.query('ROLLBACK')
                throw error
            }
        }
        else if (type === "computador") {
            try{
            await pool.query('BEGIN')
            
            const cpu = req.body.cpu
            if (cpu === undefined) {
                return res.status(400).json()
            }
            
                
            await pool.query('INSERT INTO computadores(cpu,produtos_produto_id) VALUES($1,$2)', [cpu, result.rows[0].produto_id])// insere nos computadores
            await pool.query('COMMIT')
            return res.status(200).json({"status":200, "results":result.rows[0].produto_id})
             
            } catch (error) {
                await pool.query('ROLLBACK')
                throw error
            }
        }
        else{
            return res.status(400).json({"status":400, "errors":"tipo de produto nao existe"})
        }
        
    },  
    update_product:async (req, res) =>{

        const produto_id = parseInt(req.params.produto_id)
        const nome = req.body.nome
        const descricao = req.body.descricao
        const preco = req.body.preco
        const stock = req.body.stock
        const tokenheader = req.headers.authorization 
        var version
        tokeninfo = jwt.verify(tokenheader, '123456')
        
        let line
        try {
            line = await pool.query('SELECT users_username FROM administrador WHERE users_username = $1',[tokeninfo.username])// verifica se o utilizador é administrador
            
        } catch (error) {
            throw(error)
        }
        if (line.rows[0] === undefined){
            return res.status(400).json({"status": 400 , "errors": "utilizador nao autorizado"})
        }
      
        try {      
            let result= await pool.query('SELECT produto_id FROM produtos WHERE produto_id= $1 ', [produto_id] )// verifica se o produto existe
         
            if (result.rows[0] === undefined) {  
                return res.status(400).json({"status":400, "errors":"produto nao existe"})
            }
        } catch (error) {
            throw(error)
        }
        try {
            await pool.query('BEGIN')
            let line2= await pool.query('select MAX(version) from versao_produto where produtos_produto_id=$1',[produto_id])// verifica a versao maxima do produto
            
            
            if(line2.rows[0].max === null){//se nao tem versao da-lhe a versao 1 
                version = 1
                
            }    
            else{//se tiver versao acrescenta 1 a versao anterior
                
                version = 1 + parseInt(line2.rows[0].max) 
                
            }    
            let date = new Date()
            const dia = date.getDate()
            const mes = date.getMonth() + 1
            const ano = date.getFullYear()
    
            const data = dia.toString() + '-' + mes.toString() + '-' + ano.toString()
            
            
            
            let produto= await pool.query('select *from produtos where produto_id=$1', [produto_id])// vai buscar os dados do produto 
            
            await pool.query('INSERT INTO versao_produto(nome,preco,stock,version,descricao,creation_date,produtos_produto_id) VALUES($1,$2,$3,$4,$5,$6,$7)', //insere os dados nao atulaizados na versao_produto
            [produto.rows[0].nome,parseInt(produto.rows[0].preco),parseInt(produto.rows[0].stock_produto),version,produto.rows[0].descricao,data,produto_id])
            
            await pool.query('UPDATE produtos SET nome=$1,preco=$2,descricao=$3,stock_produto=$4 WHERE produto_id=$5', [nome,preco,descricao,stock,produto_id])// da update ao produto
            await pool.query('COMMIT')
            return res.status(200).json({ "status":200})
        } catch (error) {
            await pool.query('ROLLBACK')
            
            return res.status(400).json({"status":400, "errors":error})
        }
    },
    info: async(req, res)=>{
        
        try{
            console.log(1)
            const id = req.params.produto_id
            var prices = []
            
            let result =await pool.query('select  nome, preco, descricao, stock_produto, (select array_agg (preco) from versao_produto where produtos_produto_id = $1) versao ,(select AVG(rating) from ratings where produtos_produto_id = $1) rating_avg, (select array_agg(comentario) from ratings where produtos_produto_id = $1)comentarios , (select array_agg(creation_date) from versao_produto where produtos_produto_id = $1) datas from produtos where produto_id= $1', [id])
            const preco_atual = result.rows[0].preco
            const precos_versoes = result.rows[0].versao
            const rating_avg = result.rows[0].rating_avg
            const descricao =result.rows[0].descricao
            const comentarios = result.rows[0].comentarios
            const stock = result.rows[0].stock_produto
            const nome = result.rows[0].nome
            const datas_versao = result.rows[0].datas
            
            let date = new Date()
            const dia = date.getDate()
            const mes = date.getMonth() + 1
            const ano = date.getFullYear()
            const data = dia.toString() + '-' + mes.toString() + '-' + ano.toString()
            
            const string = preco_atual + ' - ' + data
            prices.push(string)
            
            for (const i in precos_versoes){
                const string = precos_versoes[i] + ' - ' + datas_versao[i]
                prices.push(string)
            }
            console.log({status: 200, result: {nome: nome, stock: stock, descricao: descricao, prices: prices, ratings: rating_avg, comentarios: comentarios}})
            return res.status(200).send({status: 200, result: {nome: nome, stock: stock, descricao: descricao, prices: prices, ratings: rating_avg, comentarios: comentarios}})
                        
        }
        catch(e){
            return res.status(400).send({status: 400, errors: e})
        }

    }
}
