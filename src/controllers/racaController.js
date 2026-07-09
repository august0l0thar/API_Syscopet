const pool = require('../../db');
//queries dos pets
const queries = require("../queries/petQueries");
//queries das raças
const racaQueries = require("../queries/racaQueries");

const getRacas = (req, res) => {
    const { especie } = req.query;
    
    // Se não passou espécie, retorna todas
    if (!especie) {
        pool.query(racaQueries.getRacas, (error, results) => {
            if (error) {
                console.error(error);
                return res.status(500).json({erro: "Erro ao buscar racas"});
            }
            return res.status(200).json(results.rows);
        })
        return;
    }
    
    // Valida a espécie
    const especiesValidas = ['cao', 'gato', 'outro'];
    if (!especiesValidas.includes(especie.toLowerCase())) {
        return res.status(400).json({ 
            erro: `Espécie inválida. Valores permitidos: ${especiesValidas.join(', ')}` 
        });
    }
    
    pool.query(racaQueries.getRacasByEspecie, [especie.toLowerCase()], (error, results) => {
        if (error) {
            console.error(error);
            return res.status(500).json({ erro: "Erro ao buscar raças" });
        }
        return res.status(200).json(results.rows);
    });
}

const addRaca = (req, res) => {
    const {nome, especie, peso_min, peso_max, altura_min, altura_max} = req.body;

    console.log(nome, especie, peso_min, peso_max, altura_min, altura_max);

    pool.query(racaQueries.addRaca, [nome, especie, peso_min, peso_max, altura_min, altura_max], (error, results) => {
        if (error) {
            console.error(error);
            return res.status(500).json({erro: "Erro ao cadastrar raca"});
        }
        console.log("Raça Cadastrada: ", nome);
        return res.status(200).json({message: "Raça Cadastrada com sucesso"});
    });
}

const getRacaById = (req, res) => {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
        return res.status(400).json({erro: "ID inválido"});
    }

    pool.query(racaQueries.getRacaById, [id], (error, results) => {
        if (error) {
            console.error(error);
            return res.status(500).json({erro: "Erro ao consultar raca"});
        }

        if (results.rows.length === 0) {
            return res.status(404).json({erro: "Raca não encontrada"});
        }

        return res.status(200).json(results.rows);
    });
}

const getIdByRaca = (req, res) => {
    const nome = req.params.nome;
    pool.query(racaQueries.getIdByRaca, [nome], (error, results) => {
        if (error) {
            console.error(error);
            return res.status(500).json({erro: "Erro ao consultar ID da raca"});
        }

        if (results.rows.length === 0) {
            return res.status(404).json({erro: "Raca não encontrada pelo ID"});
        }

        return res.status(200).json(results.rows);
    });
}

const updateRaca = (req, res) => {
    const id = parseInt(req.params.id);
    const {nome, especie, peso_min, peso_max, altura_min, altura_max} = req.body;

    if (isNaN(id)) {
        return res.status(400).json({ erro: "ID inválido" });
    }
    
    // Verifica se a raca existe
    pool.query(racaQueries.getRacaById, [id], (error, results) => {
        if (error) {
            console.error(error);
            return res.status(500).json({ erro: "Erro ao consultar raca" });
        }

        if (results.rows.length === 0) {
            return res.status(404).json({ erro: "Raca não encontrada" });
        }

        // Executa o update
        pool.query(racaQueries.updateRaca, [nome, especie, peso_min, peso_max, altura_min, altura_max, id], (error, results) => {
            if (error) {
                console.error(error);
                return res.status(500).json({ erro: "Erro ao atualizar raca" });
            }

            return res.status(200).json({ mensagem: "Raca atualizada com sucesso"});
        });
    });
}

module.exports = {
    getRacas,
    getRacaById,
    getIdByRaca,
    addRaca,
    updateRaca,
};