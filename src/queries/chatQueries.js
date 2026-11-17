const db = require('../../db');

// Buscar histórico
async function buscarHistorico(idUsuario) {
    const resultado = await db.query(
        `SELECT *
         FROM mensagens_chat
         WHERE id_usuario = $1
         ORDER BY created_at ASC`,
        [idUsuario]
    );

    return resultado.rows;
}

// Salvar mensagem
async function salvarMensagem(idUsuario, role, conteudo) {
    const resultado = await db.query(
        `INSERT INTO mensagens_chat
         (id_usuario, role, conteudo)
         VALUES ($1, $2, $3)
         RETURNING *`,
        [idUsuario, role, conteudo]
    );

    return resultado.rows[0];
}

// Limpar histórico
async function limparHistorico(idUsuario) {
    await db.query(
        `DELETE FROM mensagens_chat
         WHERE id_usuario = $1`,
        [idUsuario]
    );
}

module.exports = {
    buscarHistorico,
    salvarMensagem,
    limparHistorico
};