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
    console.log("Entrou no addusuario")
    const { nome, email, senha } = req.body;
    const dataCriacao = new Date();

    //verifica se o email já existe
    pool.query(queries.checkEmailExists, [email], (error, results) => {
        console.log("checando email")
        if (results.rows.length) {
            res.send("E-mail já cadastrado.");
            console.log("email já existe");
        }
        console.log("entrando no add usuario");
        //adiciona usuario ao bd
        pool.query(queries.addUsuario, [nome, email, senha, dataCriacao], (error, results) => {
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
            res.status(200).send("Usuário atualizado com sucesso");
        });
    });
};

const login = (req, res) => {
    const { email, senha } = req.body;

    pool.query(queries.getUsuarioByEmail, [email], (error, results) => {
        const UsuarioNaoEncontrado =
            !results.rows.length;

        if (UsuarioNaoEncontrado) {
            return res.status(404).send("Usuário não encontrado.");
        }

        const usuario = results.rows[0];

        if (usuario.senha !== senha) {
            return res.status(401).send("senha incorreta.");
        }

        return res.status(200).json({
            message: "Login realizado com sucesso.",
            user: usuario,
        });
    }
    );
};

module.exports = {
    getUsuario,
    getUsuarioById,
    addUsuario,
    deleteUsuario,
    updateUsuario,
    login,
};