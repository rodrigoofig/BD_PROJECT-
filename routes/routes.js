const express = require("express");
const router = require("express-promise-router")();
const usercontrollers = require("../controllers/userControllers");
const qandrcontrollers = require("../controllers/qandrController");
const middlewares = require("../controllers/middlewares");
const cupoes = require("../controllers/cupoesController");
const productcontrollers = require("../controllers/productControllers");

router.route("/dbproj/user").post(usercontrollers.register).put(usercontrollers.login);
router.route("/dbproj/questions/:prod_id").post(qandrcontrollers.create_question);
router
  .route("/dbproj/questions/:prod_id/:question_id")
  .post(qandrcontrollers.create_response);
router.route("/dbproj/rating/:prod_id").post(qandrcontrollers.add_rating);
router.route("/dbproj/campaign").post(cupoes.createCampanha);
router.route("/dbproj/order").post(productcontrollers.cart);
router.route("/dbproj/subscribe/:campanha_id").put(cupoes.subscribe);
router
  .route("/dbproj/product/:produto_id")
  
  .put(productcontrollers.update_product)
  

router.route("/dbproj/product").post(productcontrollers.criar_novo_produto)
router.route("/dbproj/product/:produto_id").get(productcontrollers.info)

module.exports = router;
