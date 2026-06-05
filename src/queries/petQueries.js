const getPets = 'SELECT id, nome FROM pets';
const getPetById = "SELECT * FROM pets WHERE id = $1";
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

module.exports = {
    getPets,
    getPetById,
    addPet,
    deletePet,
    criarUpdatePet,
};