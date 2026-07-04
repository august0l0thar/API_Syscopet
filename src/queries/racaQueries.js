const db = require('../../db');

// Busca todas as raças
const getRacas = "SELECT * FROM raca";
// Busca raças por ID
const getRacaById = "SELECT * FROM raca WHERE id = $1";
//Busca ID da raça pelo nome
const getIdByRaca = "SELECT id FROM raca WHERE nome = $1";
// Busca raças por espécie
const getRacasByEspecie = "SELECT * FROM raca WHERE especie = $1";

// Busca a raça SRD (Sem Raça Definida)
const getRacaSRD = "SELECT * FROM racas WHERE UPPER(nome) LIKE 'SRD%'";

const addRaca = "INSERT into raca (nome, especie, peso_min, peso_max, altura_min, altura_max) VALUES ($1, $2, $3, $4, $5, $6)";
const updateRaca = "UPDATE raca SET nome = $1, especie = $2, peso_min = $3, peso_max = $4, altura_min = $5, altura_max = $6 WHERE id = $7";

module.exports = {
    getRacas,
    getRacaById,
    getIdByRaca,
    getRacasByEspecie,
    getRacaSRD,
    addRaca,
    updateRaca,
};