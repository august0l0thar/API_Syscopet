const pool = require('../../db');
//Queries dos lembretes
const lembreteQueries = require('../queries/lembreteQueries');

const getLembretePet = (req, res) => {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
        return res.status(400).json({ erro: "ID inválido" });
    }

    pool.query(lembreteQueries.getLembretePet, [id], (error, results) => {
        if (error) {
            console.error(error);
            return res.status(500).json({
                erro: "Erro ao consultar lembretes"
            });
        }

        return res.status(200).json(results.rows);
    });
}

const addLembrete = (req, res) => {
    try{
        const { id_pet, titulo, descricao, data_hora, tipo, recorrencia } = req.body;

        if (!id_pet || !titulo || !data_hora || !tipo || !recorrencia) {
            return res.status(400).json({ erro: "Campos obrigatórios faltando" });
        }

        const dataLembrete = new Date(data_hora);
        const agora = new Date();

        if (dataLembrete < agora) {
            return res.status(400).json({ erro: "Não é possível criar lembretes com data/hora no passado" });
        }
        
        const tiposValidos = ['alimentacao', 'banho', 'medicamento', 'consulta', 'vacina'];
        const recorrenciasValidas = ['unica', 'diaria', 'semanal', 'mensal', 'outro'];

        if (!tiposValidos.includes(tipo)) {
            return res.status(400).json({ erro: "Tipo de lembrete inválido" });
        }
        if (!recorrenciasValidas.includes(recorrencia)) {
            return res.status(400).json({ erro: "Tipo de recorrência inválido" });
        }

        const ativo = req.body.ativo = (req.body.ativo) ? req.body.ativo : true;

        pool.query(lembreteQueries.addLembrete, [titulo, descricao, data_hora, tipo, recorrencia, ativo, id_pet,], (error, results) => {
            if (error) {
                console.error(error);
                return res.status(500).json({ erro: "Erro ao criar lembrete" });
            }
            return res.status(201).json({ 
                mensagem: "Lembrete criado com sucesso"
            });
        }); 
    } catch (error) {
        console.error(error);
        return res.status(500).json({ erro: "Erro interno do servidor" });
    }    
}

const deleteLembrete = (req, res) => {
    const id = req.params.id;

    if (isNaN(id)) {
        return res.status(400).json({ erro: "ID inválido" });
    }

    pool.query(lembreteQueries.getLembretePet, [id], (error, results) => {
        if (error) {
            console.error(error);
            return res.status(500).json({
                erro: "Erro ao consultar lembrete"
            });
        }

        //Verifica se o usuário existe
        if (results.rows.length === 0) {
            return res.status(404).json({
                erro: "Lembrete não encontrado"
            });
        }

        pool.query(lembreteQueries.deleteLembrete, [id], (error, results) => {
            if (error) {
                console.error(error);
                return res.status(500).json({
                    erro: "Erro ao remover lembrete"
                });
            }
            
            return res.status(200).json({
                mensagem: "Lembrete removido com sucesso"
            });
        });
    });
}

module.exports = {
    getLembretePet,
    addLembrete,
    deleteLembrete,
};