var database = require("../database/config");

function autenticar(email, senha) {
    var instrucaoSql = `
        SELECT u.idUsuario, u.nome, u.email, e.codigo AS estilo, p.metaSemanalMin AS meta
        FROM usuario u
        JOIN estilo e ON e.idEstilo = u.fkEstilo
        JOIN perfil_usuario p ON p.idUsuario = u.idUsuario
        WHERE u.email = ? AND u.senha = ?;
    `;
    return database.executar(instrucaoSql, [email, senha]);
}

function buscarPorEmail(email) {
    var instrucaoSql = `SELECT idUsuario FROM usuario WHERE email = ?;`;
    return database.executar(instrucaoSql, [email]);
}

function cadastrar(nome, email, senha, estilo, tempo, sentido) {
    var instrucaoSql = `
        INSERT INTO usuario (nome, email, senha, fkEstilo, fkTempo, fkSentido)
        SELECT ?, ?, ?, e.idEstilo, t.idTempo, s.idSentido
        FROM estilo e, tempo_pratica t, sentido s
        WHERE e.codigo = ? AND t.codigo = ? AND s.codigo = ?;
    `;
    return database.executar(instrucaoSql, [nome, email, senha, estilo, tempo, sentido]);
}
function criarPerfil(idUsuario) {
    var instrucaoSql = `INSERT INTO perfil_usuario (idUsuario) VALUES (?);`;
    return database.executar(instrucaoSql, [idUsuario]);
}

module.exports = { autenticar, buscarPorEmail, cadastrar, criarPerfil };