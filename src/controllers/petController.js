const pool = require('../../db');
const queries = require("../queries/petQueries");
const { validarPet } = require('../validators/petValidator');

const getPets = (req, res) => {
    pool.query(queries.getPets, (error, results) => {
        if (error) {
            console.error(error);
            return res.status(500).json({
                erro: "Erro ao buscar pets"
            });
        }
        res.status(200).json(results.rows);
    })
};

const getPetById = (req, res) => {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
        return res.status(400).json({erro: "ID inválido"});
    }

    pool.query(queries.getPetById, [id], (error, results) => {
        if (error) {
            console.error(error);
            return res.status(500).json({
                erro: "Erro ao consultar pet"
            });
        }

        if (results.rows.length === 0) {
            return res.status(404).json({
                erro: "Pet não encontrado"
            });
        }

        return res.status(200).json(results.rows);
    }); 
};

const addPet = async (req, res) => {
    try{
        const dados = req.body;
        const usuarioId = req.body.id_usuario; 

        // Valida nome
        if (!dados.nome || typeof dados.nome !== 'string' || dados.nome.trim() === '') {
            return res.status(400).json({ erro: 'Nome é obrigatório' });
        }

        // Valida todos os campos (isUpdate = false)
        const validacao = validarPet(dados, false);

        if (!validacao.valido) {
            return res.status(400).json({ erros: validacao.erros });
        }

        const valores = [
            dados.nome.trim(),
            validacao.dados.especie || null,
            validacao.dados.data_nascimento || null,
            validacao.dados.peso,
            validacao.dados.altura || null,
            validacao.dados.porte || null,
            usuarioId
        ];

        //adiciona pet ao bd
        pool.query(queries.addPet, valores, (error, results) => {
            if (error) {
                console.error(error);
                return res.status(500).json({
                    erro: "Erro ao cadastrar pet"
                });
            }

            console.log("Pet cadastrado");

            return res.status(201).json({
                mensagem: "Pet cadastrado com sucesso"
            });
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({
            erro: "Erro interno do servidor"
        });
    }
};

const updatePet = (req, res) => {
    const id = parseInt(req.params.id);
    const dados = req.body;

    if (isNaN(id)) {
        return res.status(400).json({ erro: "ID inválido" });
    }

    // Valida os campos enviados (isUpdate = true)
    const validacao = validarPet(dados, true);

    if (!validacao.valido) {
        return res.status(400).json({ erros: validacao.erros });
    }
    
    // Verifica se o pet existe
    pool.query(queries.getPetById, [id], (error, results) => {
        if (error) {
            console.error(error);
            return res.status(500).json({ erro: "Erro ao consultar pet" });
        }

        if (results.rows.length === 0) {
            return res.status(404).json({ erro: "Pet não encontrado" });
        }

        // Função para validação dos dados
        const updateInfo = queries.criarUpdatePet(validacao.dados);

        if (!updateInfo) {
            return res.status(400).json({ 
                erro: "Nenhum campo válido enviado para atualização" 
            });
        }

        // Adiciona o ID no final dos valores
        updateInfo.valores.push(id);

        // Executa o update
        pool.query(updateInfo.query, updateInfo.valores, (error, results) => {
            if (error) {
                console.error(error);
                return res.status(500).json({ erro: "Erro ao atualizar pet" });
            }

            return res.status(200).json({ mensagem: "Pet atualizado com sucesso"});
        });
    });
};


const deletePet = (req, res) => {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
        return res.status(400).json({erro: "ID inválido"});
    }

    pool.query(queries.getPetById, [id], (error, results) => {
        if (error) {
            console.error(error);
            return res.status(500).json({
                erro: "Erro ao consultar pet"
            });
        }

        //Verifica se o usuário existe
        if (results.rows.length === 0) {
            return res.status(404).json({
                erro: "Pet não encontrado"
            });
        }

        pool.query(queries.deletePet, [id], (error, results) => {
            if (error) {
                console.error(error);
                return res.status(500).json({
                    erro: "Erro ao remover pet"
                });
            }
            
            return res.status(200).json({
                mensagem: "Pet removido com sucesso"
            });
        });
    });
};

module.exports = {
    getPets,
    getPetById,
    addPet,
    updatePet,
    deletePet,
};