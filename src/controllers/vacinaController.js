const pool = require('../../db');

const vacinaQueries = require("../queries/vacinaQueries");

const getVacinas = (req, res) => {
    const { especie } = req.query;

    if(!especie){
        pool.query(vacinaQueries.getVacinas, (error, results) => {
            if (error) {
                console.error(error);
                return res.status(500).json({erro: "Erro ao buscar todas as vacinas"});
            }
            return res.status(200).json(results.rows);
        }); 
        return;
    }

    const especiesValidas = ['cao', 'gato'];
    if (!especiesValidas.includes(especie.toLowerCase())) {
        return res.status(400).json({ 
            erro: `Espécie inválida. Valores permitidos: ${especiesValidas.join(', ')}` 
        });
    }

    pool.query(vacinaQueries.getVacinasByEspecie, [especie.toLowerCase()], (error, results) => {
        if (error) {
            console.error(error);
            return res.status(500).json({ erro: `Erro ao buscar vacinas para ${especie}s` });
        }
        return res.status(200).json(results.rows);
    });
};

const addVacina = (req, res) => {
    const {nome, doenca_protegida, especie, obrigatoria, essencial, idade_minima, quantidade_doses, 
           intervalo_doses, intervalo_reforco, ativa} = req.body;

    const dados = [
        nome, 
        doenca_protegida, 
        especie, 
        obrigatoria, 
        essencial, 
        idade_minima, 
        quantidade_doses, 
        intervalo_doses, 
        intervalo_reforco, 
        ativa
    ];

    pool.query(vacinaQueries.addVacina, dados, (error, results) => {
        if (error) {
            console.error(error);
            return res.status(500).json({erro: "Erro ao cadastrar vacina"});
        }
        console.log("Vacina Cadastrada: ", nome);
        return res.status(200).json({message: "Vacina Cadastrada com sucesso"});
    });
};

const updateVacina = (req, res) => {
    const id = parseInt(req.params.id);
    const {nome, doenca_protegida, especie, obrigatoria, essencial, idade_minima, quantidade_doses, 
           intervalo_doses, intervalo_reforco, ativa} = req.body;

    if (isNaN(id)) {
        return res.status(400).json({ erro: "ID inválido" });
    }

    const dados = [
        nome, 
        doenca_protegida, 
        especie, 
        obrigatoria, 
        essencial, 
        idade_minima, 
        quantidade_doses, 
        intervalo_doses, 
        intervalo_reforco, 
        ativa
    ];
    
    // Verifica se a vacina existe
    pool.query(vacinaQueries.getVacinaByID, [id], (error, results) => {
        if (error) {
            console.error(error);
            return res.status(500).json({ erro: "Erro ao consultar vacina" });
        }

        if (results.rows.length === 0) {
            return res.status(404).json({ erro: "Vacina não encontrada" });
        }

        // Executa o update
        pool.query(vacinaQueries.updateVacina, dados, (error, results) => {
            if (error) {
                console.error(error);
                return res.status(500).json({ erro: "Erro ao atualizar vacina" });
            }

            return res.status(200).json({ mensagem: "Vacina atualizada com sucesso"});
        });
    });
};

module.exports = {
    getVacinas,
    addVacina,
    updateVacina,
};