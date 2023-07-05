const express = require("express");
const jwt = require("jsonwebtoken");

const masterKey = "bd_e_fixe";

module.exports = {
    masterKey: masterKey,
    
    authenticateToken:(req, res, next) => {
        console.log(req.headers);
        if(req.headers["authorization"]===masterKey){
            next();
            return
        }
        const authHeader = req.headers['authorization']
        const token = authHeader && authHeader.split(' ')[1]
        if (token == null) return res.sendStatus(401)
        
        jwt.verify(token, '123456', (err, user) => {
            console.log(err)
            if (err) return res.sendStatus(403)
            req.user = user
            next()
        })
    },
    adminPerm: async (req, res, next) =>{
        if(req.headers["authorization"]===masterKey){
            next();
            return
        }
        try {
            const user = req.user;
            console.log(req.user);
            if(user.type === "administrador"){
                next();
            }
            else{
                res.status(500).send({error:"Your key does not have permition"})
            }
        } catch (error) {
            res.status(500).send({error:"Your key does not exist"})
        }
        
    },
    masterPerm: (req, res, next) =>{
        if(req.headers["authorization"]===masterKey){
            next();
        }else{
            res.status(500).send({error:"Your key does not have permition"})
        }
    },
    isMaster: (key)=>{
        if(key===masterKey){
            return true
        }
        return false
    }
}