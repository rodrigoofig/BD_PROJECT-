const express = require("express");
const jwt = require("jsonwebtoken");
const pool = require("../connection");

//definir as funcoes (VIEWS)
module.exports = {
  create_question: async (req, res) => {
    const prod_id = req.params.prod_id;
    const question = req.body.question;
    const autherization = req.headers.authorization;
    const user = jwt.verify(autherization, "123456").username;
    console.log(prod_id, question, user);
    try {
      let result = await pool.query(
        "INSERT INTO perguntas (produtos_produto_id, pergunta, users_username) VALUES ($1, $2, $3) RETURNING (pergunta_id)",
        [prod_id, question, user]
      );

      return res
        .status(200)
        .json({ status: 200, results: result.rows[0]["pergunta_id"] });
    } catch (error) {
      return res.status(500).json({ err: error });
    }
  },

  create_response: async (req, res) => {
    const prod_id = req.params.prod_id;
    const question_id = req.params.question_id;
    const response = req.body.question;
    const autherization = req.headers.authorization;
    const user = jwt.verify(autherization, "123456").username;
    console.log(prod_id, question_id, response, user);
    pool.query(
      "INSERT INTO respostas (perguntas_pergunta_id, resposta, users_username) VALUES ($1, $2, $3) RETURNING (resposta_id)",
      [question_id, response, user],
      (error, result) => {
        if (error) {
          return res.status(500).json({ err: error });
        }
        return res
          .status(200)
          .json({ status: 200, results: result.rows[0]["resposta_id"] });
      }
    );
  },
  add_rating: async (req, res) => {
    const prod_id = req.params.prod_id;
    const rating = req.body.rating;
    const comment = req.body.comment;
    const autherization = req.headers.authorization;

    const user = jwt.verify(autherization, "123456").username;
    console.log(prod_id, rating, comment, user);
    pool.query(
      "INSERT INTO ratings (produtos_produto_id, rating, comentario, users_username) VALUES ($1, $2, $3, $4) RETURNING (rating_id)",
      [prod_id, rating, comment, user],
      (error, result) => {
        if (error) {
          return res.status(500).json({ err: error });
        }
        return res
          .status(200)
          .json({ status: 200, results: result.rows[0]["rating_id"] });
      }
    );
  },
};
