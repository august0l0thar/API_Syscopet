const pool = require('../../db');
const queries = require("./queries");
const bcrypt = require('bcrypt');

//Teste para verificar conexão com supabase
/*pool.query('SELECT NOW()', (err, res) => {
    console.log(err, res.rows);
});*/

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

const addUsuario = async (req, res) => {
    try{
        const { nome, email, senha } = req.body;

        //verifica se o email já existe
        pool.query(queries.checkEmailExists, [email], async (error, results) => {
            console.log("checando email")
            if (results.rows.length) {
                res.send("E-mail já cadastrado.");
                console.log("email já existe");
            }
            
            //criptografia da senha
            const saltRounds = 10;
            const senhaHash = await bcrypt.hash(senha, saltRounds);

            //adiciona usuario ao bd
            pool.query(queries.addUsuario, [nome, email, senhaHash], (error, results) => {
                if (error) throw error;
                res.status(201).send("Usuario cadastrado com sucesso.");
                console.log("Usuario cadastrado");
            });
        });
    } catch (err) {
        console.error(err);
        res.status(500).send("Erro interno do servidor.");
    }
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
    const { senha } = req.body;

    pool.query(queries.getUsuarioById, [id], async (error, results) => {
        const UsuarioNaoEncontrado = !results.rows.length;
        if (UsuarioNaoEncontrado){
            res.send("Usuario não está cadastrado no banco de dados.");
        }

        //criptografia da senha
        const saltRounds = 10;
        const senhaHash = await bcrypt.hash(senha, saltRounds);

        pool.query(queries.updateUsuario, [senhaHash, id], (error, results) => {
            if (error) throw error;
            res.status(200).send("Usuário atualizado com sucesso");
        });
    });
};

const login = async (req, res) => {
    try{
        const { email, senha } = req.body;

        pool.query(queries.getUsuarioByEmail, [email], async (error, results) => {
            if (error) throw error;

            const UsuarioNaoEncontrado = !results.rows.length;

            if (UsuarioNaoEncontrado) {
                return res.status(404).send("Usuário não encontrado.");
            }

            const usuario = results.rows[0];

            // comparação de senha
            const senhaCorreta = await bcrypt.compare(senha, usuario.senha);

            if (!senhaCorreta) {
                return res.status(401).send("senha incorreta.");
            }

            return res.status(200).json({
                message: "Login realizado com sucesso.",
                user: {
                    id: usuario.id,
                    nome: usuario.nome,
                    email: usuario.email
                },
            });
        }
        );
    } catch (err) {
        console.error(err);
        res.status(500).send("Erro interno do servidor.");
    }
};

module.exports = {
    getUsuario,
    getUsuarioById,
    addUsuario,
    deleteUsuario,
    updateUsuario,
    login,
};