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

function cadastrar(nome, email, senha, estilo) {
    var instrucaoSql = `
        INSERT INTO usuario (nome, email, senha, fkEstilo)
        SELECT ?, ?, ?, e.idEstilo
        FROM estilo e
        WHERE e.codigo = ?;
    `;
    return database.executar(instrucaoSql, [nome, email, senha, estilo]);
}

function criarPerfil(idUsuario) {
    var instrucaoSql = `INSERT INTO perfil_usuario (idUsuario) VALUES (?);`;
    return database.executar(instrucaoSql, [idUsuario]);
}

module.exports = { autenticar, buscarPorEmail, cadastrar, criarPerfil };