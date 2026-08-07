const getVacinas = "SELECT * FROM vacinas";

const getVacinaByID = "SELECT * FROM vacinas WHERE id = $1";

const getVacinasByEspecie = "SELECT * FROM vacinas WHERE especie = $1";

const addVacina = "INSERT INTO vacinas (nome, doenca_protegida, especie, obrigatoria, essencial, idade_minima, quantidade_doses, intervalo_doses, intervalo_reforco, ativa) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)";

const updateVacina = "UPDATE vacinas SET nome = $1, doenca_protegida = $2, especie = $3, obrigatoria = $4, essencial = $5, idade_minima = $6, quantidade_doses = $7, intervalo_doses = $8, intervalo_reforco = $9, ativa = $10 WHERE id = $11";

module.exports = {
    getVacinas,
    getVacinaByID,
    getVacinasByEspecie,
    addVacina,
    updateVacina
};