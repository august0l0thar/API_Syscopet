const getLembretePet = "SELECT * FROM lembretes WHERE id_pet = $1";

const addLembrete = "INSERT INTO lembretes (titulo, descricao, data_hora, tipo, recorrencia, ativo, id_pet) VALUES ($1, $2, $3, $4, $5, $6, $7)";

const updateLembrete = "UPDATE lembretes SET titulo = $1, descricao = $2, data_hora = $3, tipo = $4, recorrencia = $5 WHERE id = $6";

const deleteLembrete = "DELETE FROM lembretes WHERE id = $1";

const mudarEstado = "UPDATE lembretes SET ativo = $1 WHERE id = $2";

module.exports = {
    getLembretePet,
    addLembrete,
    updateLembrete,
    deleteLembrete,
    mudarEstado,
}