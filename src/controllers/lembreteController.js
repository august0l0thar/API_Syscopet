const pool = require('../../db');
//Queries dos lembretes
const lembreteQueries = require('../queries/lembreteQueries');

const getLembretePet = (req, res) => {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
        return res.status(400).json({erro: "ID inválido"});
    }

    pool.queries(lembreteQueries.getLembretePet, [id], (error, results) => {
        if (error) {
            console.error(error);
            return res.status(500).json({
                erro: "Erro ao consultar lembretes"
            });
        }

        if (results.rows.length === 0) {
            return res.status(404).json({
                erro: "Lembrete não encontrado"
            });
        }

        return res.status(200).json(results.rows);
    });
}

const addLembrete = (req, res) => {
    const dados = req.body;
    const recorrenciasValidas = ['unica', 'diaria', 'semanal', 'mensal', 'outro']; 

    if(!dados.titulo) return res.status(400).json({ erro: 'Titulo é obrigatório' });

    dados.descricao = (dados.descricao) ? dados.descricao : null;

    if(!dados.data_hora) return res.status(400).json({ erro: 'Data e hora são obrigatórias' });

    dados.recorrencia = (!dados.recorrencia) ? dados.recorrencia : 'unica';
    
    dados.ativo = (dados.ativo) ? dados.ativo : true;

    pool.query(lembreteQueries.addLembrete, [dados], (error, results) => {

    });
}