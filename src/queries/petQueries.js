const db = require('../../db');

const getPets = 'SELECT id, nome FROM pets';
const getPetById = "SELECT * FROM pets WHERE id = $1";
const getPetByUsuario = "SELECT * FROM pets WHERE id_usuario = $1";
const addPet = "INSERT INTO pets (nome, especie, data_nascimento, peso, altura, porte, id_usuario) VALUES ($1, $2, $3, $4, $5, $6, $7)";
const deletePet = "DELETE FROM pets WHERE id = $1";

const criarUpdatePet = (dados) => {
    const camposPermitidos = ['nome', 'especie', 'data_nascimento', 'peso', 'altura', 'porte'];
    const campos = [];
    const valores = [];
    let indice = 1;

    camposPermitidos.forEach(campo => {
        if (dados[campo] !== undefined && dados[campo] !== null && dados[campo] !== '') {
            campos.push(`${campo} = $${indice}`);
            valores.push(dados[campo]);
            indice++;
        }
    });

    if (campos.length === 0) {
        return null; 
    }

    const query = `UPDATE pets SET ${campos.join(', ')} WHERE id = $${indice}`;
    return { query, valores };
};

const updateFotoPet = async (id, photoUrl) => {
  const query = `UPDATE pets SET url_foto = $1 WHERE id = $2 RETURNING *`;
  const values = [photoUrl, id];
  const result = await db.query(query, values);
  return result.rows[0];
};

//Raças
const getRacas = "SELECT * FROM raca";
const getRacaById = "SELECT * FROM raca WHERE id = $1";
const addRaca = "INSERT into raca (nome, especie, peso_min, peso_max, altura_min, altura_max) VALUES ($1, $2, $3, $4, $5, $6)";
const updateRaca = "UPDATE raca SET nome = $1, especie = $2, peso_min = $3, peso_max = $4, altura_min = $5, altura_max = $6 WHERE id = $7";

module.exports = {
    getPets,
    getPetById,
    getPetByUsuario,
    addPet,
    deletePet,
    criarUpdatePet,
    updateFotoPet,
    getRacas,
    getRacaById,
    addRaca,
    updateRaca,
};