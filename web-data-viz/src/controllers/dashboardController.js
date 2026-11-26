var dashboardModel = require("../models/dashboardModel");

function pessoal(req, res) {
    var idUsuario = Number(req.params.idUsuario);
    var periodo = Number(req.params.periodo);

    if (!Number.isInteger(idUsuario) || idUsuario < 1) {
        res.status(400).send("idUsuario inválido!");
        return;
    }
    if (periodo != 7 && periodo != 30) {
        res.status(400).send("O período deve ser 7 ou 30 dias!");
        return;
    }

    var dados = {};

    dashboardModel.minutosPeriodo(idUsuario, periodo)
        .then(function (r) {
            dados.minutos = Number(r[0].minutos);
            return dashboardModel.videosPeriodo(idUsuario, periodo);
        })
        .then(function (r) {
            dados.videos = r[0].videos;
            return dashboardModel.metaSemana(idUsuario);
        })
        .then(function (r) {
            if (r.length > 0) {
                dados.minutosSemana = Number(r[0].minutosSemana);
                dados.meta = r[0].meta;
            } else {
                dados.minutosSemana = 0;
                dados.meta = 180;
            }
            return dashboardModel.videosPorEstilo(idUsuario, periodo);
        })
        .then(function (r) {
            dados.videosPorEstilo = r;
            res.json(dados);
        })
        .catch(function (erro) {
            console.log("\nErro no dashboard pessoal: ", erro);
            res.status(500).json(erro.sqlMessage || erro);
        });
}

function semana(req, res) {
    var idUsuario = Number(req.params.idUsuario);
    var inicio = req.params.inicio;
    var fim = req.params.fim;

    if (!Number.isInteger(idUsuario) || idUsuario < 1) {
        res.status(400).send("idUsuario inválido!");
        return;
    }

    if (inicio.length != 10 || fim.length != 10) {
        res.status(400).send("As datas devem estar no formato AAAA-MM-DD!");
        return;
    }

    dashboardModel.minutosPorDia(idUsuario, inicio, fim)
        .then(function (r) {
            res.json(r);
        })
        .catch(function (erro) {
            console.log("\nErro no filtro de semana: ", erro);
            res.status(500).json(erro.sqlMessage || erro);
        });
}

module.exports = { pessoal, semana };
