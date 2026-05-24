const pool = require('../../db');
const queries = require("./queries");

const getUsuario = (req, res) => {
    pool.query(queries.getUsuarios, (error, results) => {
        if (error) throw error;
        res.status(200).json(results.rows);
    })
};

const getUsuarioById = (req, res) => {
    const id = parseInt(req.params.id);
    pool.query(queries.getUsuarioById, [id], (error, results) => {
        if (error) throw error;
        res.status(200).json(results.rows);
    }); 
};

const addUsuario = (req, res) => {
    const { nome, email, senha } = req.body;
    //verifica se o email já existe
    pool.query(queries.checkEmailExists, [email], (error, results) => {
        if (results.rows.lenght) {
            res.send("E-mail já cadastrado.");
        }

        //adiciona usuario ao bd
        pool.query(queries.addUsuario, [nome, email, senha], (error, results) => {
            if (error) throw error;
            res.status(201).send("Usuario cadastrado com sucesso.");
            console.log("Usuario cadastrado");
        });
    });
};

const deleteUsuario = (req, res) => {
    const id = parseInt(req.params.id);

    pool.query(queries.getUsuarioById, [id], (error, results) => {
        const UsuarioNaoEncontrado = !results.rows.length;
        if (UsuarioNaoEncontrado){
            res.send("Usuario não está cadastrado no banco de dados, impossível removê-lo.");
        }

        pool.query(queries.deleteUsuario, [id], (error, results) => {
            if (error) throw error;
            res.status(200).send("Usuário removido com sucesso.");
        });
    });
};

const updateUsuario = (req, res) => {
    const id = parseInt(req.params.id);
    const { nome } = req.body;

    pool.query(queries.getUsuarioById, [id], (error, results) => {
        const UsuarioNaoEncontrado = !results.rows.length;
        if (UsuarioNaoEncontrado){
            res.send("Usuario não está cadastrado no banco de dados.");
        }

        pool.query(queries.updateUsuario, [nome, id], (error, results) => {
            if (error) throw error;
            res.status(200).send("Usuario atualizado com sucesso");
        });
    });
};

module.exports = {
    getUsuario,
    getUsuarioById,
    addUsuario,
    deleteUsuario,
    updateUsuario,
};