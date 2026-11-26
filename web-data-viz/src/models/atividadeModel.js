var database = require("../database/config");

function registrarEnsaio(idUsuario, estilo, minutos) {
    var instrucaoSql = `
        INSERT INTO ensaio (fkUsuario, fkEstilo, minutos)
        SELECT ?, idEstilo, ? FROM estilo WHERE codigo = ?;
    `;
    return database.executar(instrucaoSql, [idUsuario, minutos, estilo]);
}

function registrarAssistido(idUsuario, idVideo) {
    var instrucaoSql = `INSERT IGNORE INTO usuario_video (fkUsuario, fkVideo) VALUES (?, ?);`;
    return database.executar(instrucaoSql, [idUsuario, idVideo]);
}

module.exports = { registrarEnsaio, registrarAssistido };
