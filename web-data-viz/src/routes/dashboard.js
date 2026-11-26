var express = require("express");
var router = express.Router();
var dashboardController = require("../controllers/dashboardController");

router.get("/pessoal/:idUsuario/:periodo", function (req, res) {
    dashboardController.pessoal(req, res);
});

router.get("/semana/:idUsuario/:inicio/:fim", function (req, res) {
    dashboardController.semana(req, res);
});

module.exports = router;
