const pool = require('../../db');
const queries = require("../queries/usuarioQueries");
const bcrypt = require('bcrypt');

// Supabase Storage
const path = require('path'); 
const supabase = require('../config/supabaseConfig');

//envio de email
const { BrevoClient } = require('@getbrevo/brevo');
// Inicializa o cliente com a chave da API das variáveis de ambiente
const brevo = new BrevoClient({ apiKey: process.env.BREVO_API_KEY });

//login com google
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
//token JWT
const jwt = require('jsonwebtoken');


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

            // Verifica se o usuário tem senha (caso ele tenha se cadastrado só com Google antes)
            if (!usuario.senha) {
                return res.status(401).json({ erro: "Esta conta foi criada com Google. Use o login do Google." });
            }

            const senhaCorreta = await bcrypt.compare(
                senha,
                usuario.senha
            );

            if (!senhaCorreta) {
                return res.status(401).json({
                    erro: "Email ou senha inválidos"
                });
            }

            //token JWT
            const token = jwt.sign(
                { id: usuario.id, email: usuario.email },
                process.env.JWT_SECRET, 
                { expiresIn: '7d' } 
            );

            return res.status(200).json({
                message: "Login realizado com sucesso.",
                token,
                user: {
                    id: usuario.id,
                    nome: usuario.nome,
                    email: usuario.email,
                    url_foto: usuario.url_foto
                }
            });
        });
    } catch (err) {
        console.error(err);
        res.status(500).send("Erro interno do servidor.");
    }
};

const loginGoogle = async (req, res) => {
     const { idToken } = req.body;

    if (!idToken) {
        return res.status(400).json({ erro: "Token do Google é obrigatório" });
    }

    try {
        // Validação do token com o Google
        const ticket = await client.verifyIdToken({
            idToken,
            audience: process.env.GOOGLE_CLIENT_ID, 
        });
        const payload = ticket.getPayload();
        
        const googleId = payload['sub'];
        const email = payload['email'];
        const nome = payload['name'];
        const fotoGoogleUrl = payload['picture']; 

        // Busca usuário pelo google_id
        const resultGoogle = await pool.query(queries.getUsuarioByGoogleId, [googleId]);
        let usuario = resultGoogle.rows[0];

        if (usuario) {
            // Cenário A: Usuário já existe e já tem o Google vinculado.
        } else {
            // Cenário B: Usuário não tem google_id, mas e se o EMAIL já existir?
            const resultEmail = await pool.query(queries.getUsuarioByEmail, [email]);
            
            if (resultEmail.rows.length > 0) {
                usuario = resultEmail.rows[0];
                // Vincula o google_id a esta conta existente
                await pool.query(queries.updateUsuarioGoogleId, [googleId, usuario.id]);
            } else {
                // Cenário C: Conta totalmente nova. Cria o usuário.
                const insertResult = await pool.query(queries.addUsuarioGoogle, [nome, email, googleId]);
                usuario = insertResult.rows[0];
            }
        }

        // GARANTIR QUE TEMOS A url_foto (caso a query anterior não tenha retornado)
        if (!usuario.url_foto) {
            const fullUser = await pool.query("SELECT url_foto FROM usuarios WHERE id = $1", [usuario.id]);
            usuario.url_foto = fullUser.rows[0]?.url_foto || null;
        }

        // Se o usuário NÃO tem foto no nosso sistema, mas o Google forneceu uma, vamos salvá-la!
        if (!usuario.url_foto && fotoGoogleUrl) {
            try {
                console.log(`Baixando foto do Google para o usuário ${usuario.id}...`);
                
                // Baixa a imagem da URL do Google
                const response = await fetch(fotoGoogleUrl);
                if (response.ok) {
                    const arrayBuffer = await response.arrayBuffer();
                    const buffer = Buffer.from(arrayBuffer);
                    
                    const fileName = `usuario-${usuario.id}-${Date.now()}.jpg`; 

                    // Faz o upload para o seu bucket
                    const { error: uploadError } = await supabase.storage
                        .from('fotos-usuarios')
                        .upload(fileName, buffer, {
                            contentType: 'image/jpeg',
                            upsert: true
                        });

                    if (!uploadError) {
                        // Gera a URL pública
                        const { data: { publicUrl } } = supabase.storage
                            .from('fotos-usuarios')
                            .getPublicUrl(fileName);

                        // Salva no banco de dados
                        await queries.updateFotoUsuario(usuario.id, publicUrl);
                        
                        // Atualiza o objeto local para retornar na resposta
                        usuario.url_foto = publicUrl;
                        console.log("Foto do Google salva no Supabase com sucesso!");
                    } else {
                        console.error("Erro ao salvar foto do Google no Supabase:", uploadError);
                    }
                }
            } catch (err) {
                // Erro não fatal: se falhar ao baixar/salvar a foto, o login ainda acontece, só sem a foto
                console.error("Erro ao processar foto do Google (login continuará sem foto):", err);
            }
        }

        //Gera o SEU token JWT
        const token = jwt.sign(
            { id: usuario.id, email: usuario.email }, 
            process.env.JWT_SECRET, 
            { expiresIn: '7d' }
        );

        return res.status(200).json({
            mensagem: "Login com Google realizado com sucesso",
            token,
            usuario: { 
                id: parseInt(usuario.id), 
                nome: usuario.nome, 
                email: usuario.email,
                url_foto: usuario.url_foto
            }
        });

    } catch (error) {
        console.error("Erro na validação do Google:", error);
        return res.status(401).json({ erro: "Token do Google inválido ou expirado" });
    }
};

const esqueceuSenha = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ erro: "O email é obrigatório" });
        }

        // Verifica se o usuário existe
        const { rows } = await pool.query(queries.getUsuarioIdByEmail, [email]);

        // Por segurança, não revelamos se o e-mail existe ou não
        if (rows.length === 0) {
            return res.status(200).json({ mensagem: "Se este email estiver cadastrado, você receberá um código." });
        }

        // Gera código e data de expiração (15 minutos)
        const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

        // Salva no banco
        await pool.query(queries.updateResetToken, [resetCode, expiresAt, email]);

        // Envia o e-mail via Brevo 
        const emailData = {
            sender: { 
                name: "4U Pet", 
                email: process.env.EMAIL_USER 
            },
            to: [{ email: email }],
            subject: "Código de Recuperação de Senha - 4U Pet 🐾",
            htmlContent: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
                    <h2 style="color: #2c3e50;">Redefinição de Senha</h2>
                    <p>Olá!</p>
                    <p>Recebemos uma solicitação para redefinir a senha da sua conta. Utilize o código abaixo:</p>
                    <div style="background: #f4f6f8; border: 2px dashed #3498db; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0;">
                        <span style="font-size: 32px; font-weight: bold; letter-spacing: 6px; color: #2c3e50;">${resetCode}</span>
                    </div>
                    <p><strong>Este código é válido por 15 minutos.</strong></p>
                    <p style="color: #7f8c8d; font-size: 14px;">Se você não solicitou isso, ignore este e-mail. Sua conta está segura.</p>
                    <p>Atenciosamente,<br><strong>Equipe 4U Pet</strong></p>
                </div>
            `
        };

        await brevo.transactionalEmails.sendTransacEmail(emailData);
        console.log("E-mail de recuperação enviado com sucesso via Brevo.");

        return res.status(200).json({ mensagem: "Se este email estiver cadastrado, você receberá um código." });

    } catch (error) {
        console.error("Erro no esqueceuSenha:", error);
        return res.status(500).json({ erro: "Erro interno do servidor ao processar a recuperação." });
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


// NOVAS FUNÇÕES DE FOTO DO USUÁRIO
const uploadFotoUsuario = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    
    // Verificar se o usuário existe
    const usuario = await pool.query(queries.getUsuarioById, [id]);
    if (!usuario || usuario.rows.length === 0) {
      return res.status(404).json({ erro: 'Usuário não encontrado' });
    }

    // Verificar se arquivo foi enviado
    if (!req.file) {
      return res.status(400).json({ erro: 'Nenhuma imagem enviada' });
    }

    // Preparar arquivo
    const fileBuffer = req.file.buffer;
    const fileName = `usuario-${id}-${Date.now()}${path.extname(req.file.originalname)}`;
    
    // Upload para o Supabase Storage
    const { data, error } = await supabase.storage
      .from('fotos-usuarios') // <-- Nome do bucket novo
      .upload(fileName, fileBuffer, {
        contentType: req.file.mimetype,
        upsert: true
      });

    if (error) {
      console.error('Erro no upload:', error);
      return res.status(500).json({ erro: 'Erro ao fazer upload da imagem' });
    }

    // Gerar URL pública
    const { data: { publicUrl } } = supabase.storage
      .from('fotos-usuarios')
      .getPublicUrl(fileName);

    // Atualizar o usuário com a URL da foto no banco de dados
    await queries.updateFotoUsuario(id, publicUrl); 

    res.json({
      mensagem: 'Foto enviada com sucesso!',
      photoUrl: publicUrl,
      usuario: { id: id }
    });

  } catch (error) {
    console.error('Erro no uploadFotoUsuario:', error);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
};

const deleteFotoUsuario = async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    // Buscar URL atual da foto
    const usuario = await pool.query(queries.getUsuarioById, [id]);
    
    if (!usuario || usuario.rows.length === 0) {
      return res.status(404).json({ erro: 'Usuário não encontrado' });
    }

    const photoUrl = usuario.rows[0].url_foto;
    
    // Se tiver foto, deletar do storage
    if (photoUrl) {
      const fileName = photoUrl.split('/').pop();
      await supabase.storage.from('fotos-usuarios').remove([fileName]);
    }

    // Atualizar banco para null
    await queries.updateFotoUsuario(id, null);

    res.json({ mensagem: 'Foto removida com sucesso!' });

  } catch (error) {
    console.error('Erro no deleteFotoUsuario:', error);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
};

module.exports = {
    getUsuario,
    getUsuarioById,
    addUsuario,
    deleteUsuario,
    updateUsuario,
    login,
    loginGoogle,
    esqueceuSenha,
    resetSenha,
    uploadFotoUsuario,
    deleteFotoUsuario,
};