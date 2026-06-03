const pool = require('../../db');
const queries = require("./queries");
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');

//configuração nodemailer
//Ethereal Email cria um e-mail falso de teste e mostra o painel de recebimento.
//Mudar futuramente para GMAIl

const transporter = nodemailer.createTransport({
    host: "smtp.ethereal.email", // Mude para 'smtp.gmail.com' se usar Gmail
    port: 587,
    auth: {
        user: "jameson.gorczany@ethereal.email", // Use variáveis de ambiente em produção
        pass: "TCjUspVEYMMPya9cMf"
    }
});

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


const esqueceuSenha = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ erro: "O email é obrigatório" });
        }

        //verifica se o usuário existe
        const { rows } = await pool.query(queries.getUsuarioIdByEmail, [email]);

        if (rows.length === 0) {
            return res.status(200).json({ mensagem: "Se este email estiver cadastrado, você receberá um código." });
        }

        // Código de 6 dígitos e data de expiração (15 minutos)
        const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

        // Salvar o token no banco
        await pool.query(queries.updateResetToken, [resetCode, expiresAt, email]);

        // Enviar o email
        const mailOptions = {
            from: '4U Pet <nao-responda@4upet.com>',
            to: email,
            subject: 'Recuperação de Senha',
            text: `Esqueceu a senha, seu animal? \nSeu código para redefinir a senha é: ${resetCode}. Ele expira em 15 minutos.`,
            html: `<p>Esqueceu a senha, seu animal?<br>Seu código para redefinir a senha é: <strong>${resetCode}</strong></p><p>Ele expira em 15 minutos.</p>`
        };

        //await transporter.sendMail(mailOptions);

        const info = await transporter.sendMail(mailOptions);

        const previewUrl = nodemailer.getTestMessageUrl(info);

        console.log("E-mail de teste enviado! Visualize aqui: %s", previewUrl);

        return res.status(200).json({ mensagem: "Se este email estiver cadastrado, você receberá um código." });

    } catch (error) {
        console.error("Erro no forgotSenha:", error);
        return res.status(500).json({ erro: "Erro interno do servidor" });
    }
};

const resetSenha = async (req, res) => {
    try {
        const { email, codigo, novaSenha } = req.body;

        if (!email || !codigo || !novaSenha) {
            return res.status(400).json({ erro: "Email, código e nova senha são obrigatórios" });
        }

        // Buscar o usuário e o token salvo
        const { rows } = await pool.query(queries.getUsuarioWithToken, [email]);

        if (rows.length === 0) {
            return res.status(400).json({ erro: "Usuário não encontrado." });
        }

        const usuario = rows[0];

        // Validação do código
        if (usuario.reset_token !== codigo) {
            return res.status(400).json({ erro: "Código inválido." });
        }

        if (new Date() > new Date(usuario.reset_token_expira_em)) {
            return res.status(400).json({ erro: "O código expirou. Solicite um novo." });
        }

        // Criptografia da Senha
        const saltRounds = 10;
        const senhaHash = await bcrypt.hash(novaSenha, saltRounds);

        // Atualizar a senha e resetar token
        await pool.query(queries.updateUsuario, [senhaHash, usuario.id]);
        await pool.query(queries.clearResetToken, [usuario.id]);

        return res.status(200).json({ mensagem: "Senha redefinida com sucesso." });

    } catch (error) {
        console.error("Erro no resetSenha:", error);
        return res.status(500).json({ erro: "Erro interno do servidor" });
    }
};

module.exports = {
    getUsuario,
    getUsuarioById,
    addUsuario,
    deleteUsuario,
    updateUsuario,
    login,
    esqueceuSenha,
    resetSenha,
};