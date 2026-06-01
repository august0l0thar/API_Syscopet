const pool = require('../../db');
const queries = require("./queries");
const bcrypt = require('bcrypt');

//Teste para verificar conexão com supabase
/*pool.query('SELECT NOW()', (err, res) => {
    console.log(err, res.rows);
});*/

const getUsuario = (req, res) => {
    pool.query(queries.getUsuarios, (error, results) => {
        if (error) {
            console.error(error);
            return res.status(500).json({
                erro: "Erro ao buscar usuários"
            });
        }
        res.status(200).json(results.rows);
    })
};

const getUsuarioById = (req, res) => {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
        return res.status(400).json({erro: "ID inválido"});
    }

    pool.query(queries.getUsuarioById, [id], (error, results) => {
        if (error) {
            console.error(error);
            return res.status(500).json({
                erro: "Erro ao consultar usuário"
            });
        }

        if (results.rows.length === 0) {
            return res.status(404).json({
                erro: "Usuário não encontrado"
            });
        }

        return res.status(200).json(results.rows);
    }); 
};

const addUsuario = async (req, res) => {
    try{
        const { nome, email, senha } = req.body;

        if (!nome || !email || !senha) {
            return res.status(400).json({
                erro: "Nome, email e senha são obrigatórios"
            });
        }

        //verifica se o email já existe
        pool.query(queries.checkEmailExists, [email], async (error, results) => {
            if (error) {
                console.error(error);
                return res.status(500).json({
                    erro: "Erro ao consultar banco de dados"
                });
            }

            if (results.rows.length > 0) {
                return res.status(409).json({
                    erro: "E-mail já cadastrado"
                });
            }
            
            //criptografia da senha
            const saltRounds = 10;
            const senhaHash = await bcrypt.hash(senha, saltRounds);

            //adiciona usuario ao bd
            pool.query(queries.addUsuario, [nome, email, senhaHash], (error, results) => {
                if (error) {
                    console.error(error);
                    return res.status(500).json({
                        erro: "Erro ao cadastrar usuário"
                    });
                }

                console.log("Usuario cadastrado");

                return res.status(201).json({
                    mensagem: "Usuário cadastrado com sucesso"
                });
            });
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({
            erro: "Erro interno do servidor"
        });
    }
};

const deleteUsuario = (req, res) => {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
        return res.status(400).json({erro: "ID inválido"});
    }

    pool.query(queries.getUsuarioById, [id], (error, results) => {
        if (error) {
            console.error(error);
            return res.status(500).json({
                erro: "Erro ao consultar usuário"
            });
        }

        //Verifica se o usuário existe
        if (results.rows.length === 0) {
            return res.status(404).json({
                erro: "Usuário não encontrado"
            });
        }

        pool.query(queries.deleteUsuario, [id], (error, results) => {
            if (error) {
                console.error(error);
                return res.status(500).json({
                    erro: "Erro ao remover usuário"
                });
            }
            
            return res.status(200).json({
                mensagem: "Usuário removido com sucesso"
            });
        });
    });
};

const updateUsuario = (req, res) => {
    const id = parseInt(req.params.id);
    const { senha } = req.body || {};

    if (isNaN(id)) {
        return res.status(400).json({erro: "ID inválido"});
    }

    if (!senha) {
        return res.status(400).json({erro: "Senha obrigatória"});
    }

    pool.query(queries.getUsuarioById, [id], async (error, results) => {
        if (error) {
            console.error(error);
            return res.status(500).json({erro: "Erro ao consultar usuário"});
        }

        if (results.rows.length === 0) {
            return res.status(404).json({erro: "Usuário não encontrado"});
        }

        //criptografia da senha
        const saltRounds = 10;
        const senhaHash = await bcrypt.hash(senha, saltRounds);

        pool.query(queries.updateUsuario, [senhaHash, id], (error, results) => {
             if (error) {
                console.error(error);
                return res.status(500).json({erro: "Erro ao atualizar usuário"});
            }

            return res.status(200).json({mensagem: "Usuário atualizado com sucesso"});
        });
    });
};

const login = async (req, res) => {
    try{
        const { email, senha } = req.body || {};

        if (!email || !senha) {
            return res.status(400).json({
                erro: "Email e senha são obrigatórios"
            });
        }

        pool.query(queries.getUsuarioByEmail, [email], async (error, results) => {
            if (error) {
                console.error(error);

                return res.status(500).json({
                    erro: "Erro ao consultar usuário"
                });
            }

            if (results.rows.length === 0) {
                return res.status(401).json({
                    erro: "Email ou senha inválidos"
                });
            }

            const usuario = results.rows[0];

            const senhaCorreta = await bcrypt.compare(
                senha,
                usuario.senha
            );

            if (!senhaCorreta) {
                return res.status(401).json({
                    erro: "Email ou senha inválidos"
                });
            }

            return res.status(200).json({
                message: "Login realizado com sucesso.",
                user: {
                    id: usuario.id,
                    nome: usuario.nome,
                    email: usuario.email
                }
            });
        });
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