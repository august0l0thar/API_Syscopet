const getVacinas = "SELECT * FROM vacinas ORDER BY id";

const getVacinaByID = "SELECT * FROM vacinas WHERE id = $1";

const getVacinasByEspecie = "SELECT * FROM vacinas WHERE especie = $1";

const addVacina = "INSERT INTO vacinas (nome, doenca_protegida, especie, obrigatoria, essencial, idade_minima, quantidade_doses, intervalo_doses, intervalo_reforco, ativa) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)";

const updateVacina = "UPDATE vacinas SET nome = $1, doenca_protegida = $2, especie = $3, obrigatoria = $4, essencial = $5, idade_minima = $6, quantidade_doses = $7, intervalo_doses = $8, intervalo_reforco = $9, ativa = $10 WHERE id = $11";

// ===== CALENDÁRIO DE VACINAS =====

const getTemplatesAtivos = 
    "SELECT * FROM vacinas WHERE ativa = true AND (especie = $1 OR especie = 'ambos')";

const insertDose = 
    "INSERT INTO calendario_vacinas (id_pet, id_vacina, dose_numero, data_prevista, tipo, status) VALUES ($1, $2, $3, $4, $5, 'pendente') RETURNING *";

const getDosePendente = 
    "SELECT * FROM calendario_vacinas WHERE id_pet = $1 AND id_vacina = $2 AND dose_numero = $3 AND tipo = $4 AND status = 'pendente'";

const getDoseAnterior = 
    "SELECT * FROM calendario_vacinas WHERE id_pet = $1 AND id_vacina = $2 AND dose_numero = $3 AND tipo = $4";

const updateDoseAplicada = 
    "UPDATE calendario_vacinas SET status = $1, data_aplicacao = $2, proximo_reforco = $3 WHERE id = $4 RETURNING *";

const updateDataPrevista = 
    "UPDATE calendario_vacinas SET data_prevista = $1 WHERE id = $2 RETURNING *";

const getCalendarioByPet = 
    "SELECT cv.*, v.nome AS vacina_nome, v.obrigatoria, v.essencial FROM calendario_vacinas cv JOIN vacinas v ON v.id = cv.id_vacina WHERE cv.id_pet = $1 ORDER BY cv.data_prevista, cv.dose_numero";

module.exports = {
    //vacinas
    getVacinas,
    getVacinaByID,
    getVacinasByEspecie,
    addVacina,
    updateVacina,
    //calendario
    getTemplatesAtivos,
    insertDose,
    getDosePendente,
    getDoseAnterior,
    updateDoseAplicada,
    updateDataPrevista,
    getCalendarioByPet,
};