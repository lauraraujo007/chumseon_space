var database = require("../database/config");

function minutosPeriodo(idUsuario, periodo) {
    var instrucaoSql = `
        SELECT IFNULL(SUM(minutos), 0) AS minutos
        FROM ensaio
        WHERE fkUsuario = ? AND dtEnsaio >= DATE_SUB(NOW(), INTERVAL ? DAY);
    `;
    return database.executar(instrucaoSql, [idUsuario, periodo], true);
}

function videosPeriodo(idUsuario, periodo) {
    var instrucaoSql = `
        SELECT COUNT(*) AS videos
        FROM usuario_video
        WHERE fkUsuario = ? AND dtAssistido >= DATE_SUB(NOW(), INTERVAL ? DAY);
    `;
    return database.executar(instrucaoSql, [idUsuario, periodo], true);
}

function metaSemana(idUsuario) {
    var instrucaoSql = `
        SELECT IFNULL(SUM(en.minutos), 0) AS minutosSemana, p.metaSemanalMin AS meta
        FROM perfil_usuario p
        LEFT JOIN ensaio en ON en.fkUsuario = p.idUsuario
                           AND en.dtEnsaio >= DATE_SUB(NOW(), INTERVAL 7 DAY)
        WHERE p.idUsuario = ?
        GROUP BY p.metaSemanalMin;
    `;
    return database.executar(instrucaoSql, [idUsuario], true);
}

function minutosPorDia(idUsuario, dataInicio, dataFim) {
    var instrucaoSql = `
        SELECT DATE_FORMAT(dtEnsaio, '%Y-%m-%d') AS dia, SUM(minutos) AS minutos
        FROM ensaio
        WHERE fkUsuario = ? AND DATE(dtEnsaio) BETWEEN ? AND ?
        GROUP BY DATE_FORMAT(dtEnsaio, '%Y-%m-%d')
        ORDER BY dia;
    `;
    return database.executar(instrucaoSql, [idUsuario, dataInicio, dataFim], true);
}

function videosPorEstilo(idUsuario, periodo) {
    var instrucaoSql = `
        SELECT e.codigo AS estilo, COUNT(*) AS videos
        FROM usuario_video uv
        JOIN video v ON v.idVideo = uv.fkVideo
        JOIN estilo e ON e.idEstilo = v.fkEstilo
        WHERE uv.fkUsuario = ? AND uv.dtAssistido >= DATE_SUB(NOW(), INTERVAL ? DAY)
        GROUP BY e.codigo;
    `;
    return database.executar(instrucaoSql, [idUsuario, periodo], true);
}

module.exports = {
    minutosPeriodo, videosPeriodo, metaSemana,
    minutosPorDia, videosPorEstilo
};
