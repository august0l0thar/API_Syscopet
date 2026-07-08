const pool = require('../../db');
//queries do usuário
const usuarioQueries = require("../queries/usuarioQueries");
//queries dos pets
const queries = require("../queries/petQueries");
//queries das raças
const racaQueries = require("../queries/racaQueries");
//Validações dos dados
const { validarPet } = require("../validators/petValidator");
//Validação do porte
const porteCalculator = require("../validators/porteCalculator");
//armazenamento das fotos
const supabase = require('../config/supabaseConfig');
const path = require('path');

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

const getPetsByUsuario = (req, res) => {
    const usuarioId = parseInt(req.params.usuarioId);

    if (isNaN(usuarioId)) {
        return res.status(400).json({ erro: "ID do usuário inválido" });
    }


    pool.query(usuarioQueries.getUsuarioById, [usuarioId], (error, results) => {
        if (error) {
            console.error(error);
            return res.status(500).json({ erro: "Erro ao consultar usuário" });
        }

        if (results.rows.length === 0) {
            return res.status(404).json({ erro: "Usuário não encontrado" });
        }

        pool.query(queries.getPetByUsuario, [usuarioId], (error, results) => {
            if (error) {
                console.error(error);
                return res.status(500).json({ erro: "Erro ao buscar pets" });
            }

            return res.status(200).json(results.rows);
        });
    });
};

const addPet = async (req, res) => {
    try{
        const dados = req.body;
        const usuarioId = req.body.id_usuario; 
        const especie = dados.especie;

        // Verifica se veio id_raca OU raca (nome)
        let id_raca = dados.id_raca;
        
        if (!id_raca && dados.raca) {
            // Se veio o nome, busca o ID
            const raca = await porteCalculator.getRacaByNome(dados.raca, dados.especie);
            
            if (!raca) {
                return res.status(404).json({ erro: `Raça "${dados.raca}" não encontrada` });
            }
            
            id_raca = raca.id;
        }
        
        // Valida se tem id_raca
        if (!id_raca) {
            return res.status(400).json({ erro: 'Raça é obrigatória' });
        }

        dados.id_raca = id_raca;

        // Valida nome
        if (!dados.nome || typeof dados.nome !== 'string' || dados.nome.trim() === '') {
            return res.status(400).json({ erro: 'Nome é obrigatório' });
        }

        // Valida todos os campos (isUpdate = false)
        const validacao = await validarPet(dados, false);

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
            id_raca,
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

            alerta_saude = (validacao.alerta_saude) ? validacao.alerta_saude : null;
            
            
            return res.status(201).json({
                mensagem: "Pet cadastrado com sucesso",
                porte: validacao.porte_calculado,
                alerta: alerta_saude 
            });
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({
            erro: "Erro interno do servidor"
        });
    }
};

const updatePet = async (req, res) => {
    const id = parseInt(req.params.id);
    const dados = req.body;

    if (isNaN(id)) {
        return res.status(400).json({ erro: "ID inválido" });
    }

    if (dados.raca) {
        const raca = await porteCalculator.getRacaByNome(dados.raca, dados.especie);
        
        if (!raca) {
            return res.status(404).json({ erro: `Raça "${dados.raca}" não encontrada` });
        }
        
        dados.id_raca = raca.id;
        delete dados.raca; // Remove o nome, usa só o ID
    }

    // Valida os campos enviados (isUpdate = true)
    const validacao = await validarPet(dados, true);

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

            porte_calculado = (validacao.dados.porte) ? validacao.dados.porte : null;
            alerta_saude = (validacao.alerta_saude) ? validacao.alerta_saude : null;
            
            return res.status(200).json({ 
                mensagem: "Pet atualizado com sucesso",
                porte: porte_calculado,
                alerta: alerta_saude,
            });
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

const uploadFotoPet = async (req, res) => {
  try {
    const id = req.params.id;
    console.log('entrou no uploadFoto do controller');
    // 🔍 DEBUG: Ver qual URL o Supabase está tentando acessar
    console.log('🔍 SUPABASE_URL:', process.env.SUPABASE_URL);
    console.log('🔍 SUPABASE_KEY:', process.env.SUPABASE_KEY ? 'definida' : 'NÃO DEFINIDA');
    
    // Verificar se o pet existe
    const petExists = await pool.query(queries.getPetById, [id]);
    if (!petExists || petExists.rows.length === 0) {
      return res.status(404).json({ error: 'Pet não encontrado' });
    }

    // Verificar se arquivo foi enviado
    if (!req.file) {
      return res.status(400).json({ error: 'Nenhuma imagem enviada' });
    }

    // Converter buffer para base64
    const fileBuffer = req.file.buffer;
    const fileName = `${id}-${Date.now()}${path.extname(req.file.originalname)}`;
    
    console.log("Antes do upload no supabase");
    // Upload para o Supabase Storage
    const { data, error } = await supabase.storage.from('fotos-pets').upload(fileName, fileBuffer, {
        contentType: req.file.mimetype,
        upsert: true // Substitui se já existir
      });

    if (error) {
      console.error('Erro no upload:', error);
      return res.status(500).json({ error: 'Erro ao fazer upload da imagem' });
    }

    console.log("Antes do upload no supabase");

    // Gera URL pública
    const { data: { publicUrl } } = supabase.storage.from('fotos-pets').getPublicUrl(fileName);

    // Atualiza o pet com a URL da foto no banco de dados
    await pool.query(queries.updateFotoPet, [publicUrl, id]); 

    res.json({
      mensagem: 'Foto enviada com sucesso!',
      photoUrl: publicUrl,
      pet: { id: id }
    });

  } catch (error) {
    console.error('Erro no uploadFotoPet:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

const deleteFotoPet = async (req, res) => {
  try {
    const id = req.params.id;

    // Buscar URL atual da foto
    const pet = await pool.query(queries.getPetById, [id]);
    if (!pet || pet.length === 0) {
      return res.status(404).json({ error: 'Pet não encontrado' });
    }

    const photoUrl = pet[0].photo_url;
    
    // Se tiver foto, deletar do storage
    if (photoUrl) {
      // Extrair nome do arquivo da URL
      const fileName = photoUrl.split('/').pop();
      
      await supabase.storage.from('fotos-pets').remove([fileName]);
    }

    // Atualizar banco para null
    await pool.query(queries.updateFotoPet, [publicUrl, id]); 

    res.json({ mensagem: 'Foto removida com sucesso!' });

  } catch (error) {
    console.error('Erro no deletePetPhoto:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

//Raças (Somente Dev, não expor funcionalidade ao usuário)
const getRacas = (req, res) => {
    const { especie } = req.query;
    
    // Se não passou espécie, retorna todas
    if (!especie) {
        pool.query(queries.getRacas, (error, results) => {
            if (error) {
                console.error(error);
                return res.status(500).json({erro: "Erro ao buscar racas"});
            }
            return res.status(200).json(results.rows);
        })
        return;
    }
    
    // Valida a espécie
    const especiesValidas = ['cao', 'gato'];
    if (!especiesValidas.includes(especie.toLowerCase())) {
        return res.status(400).json({ 
            erro: `Espécie inválida. Valores permitidos: ${especiesValidas.join(', ')}` 
        });
    }
    
    pool.query(racaQueries.getRacasByEspecie, [especie.toLowerCase()], (error, results) => {
        if (error) {
            console.error(error);
            return res.status(500).json({ erro: "Erro ao buscar raças" });
        }
        return res.status(200).json(results.rows);
    });
}

const addRaca = (req, res) => {
    const {nome, especie, peso_min, peso_max, altura_min, altura_max} = req.body;

    pool.query(queries.addRaca, [nome, especie, peso_min, peso_max, altura_min, altura_max], (error, results) => {
        if (error) {
            console.error(error);
            return res.status(500).json({erro: "Erro ao cadastrar raca"});
        }
        console.log("Raça Cadastrada: ", nome);
        return res.status(200).json({message: "Raça Cadastrada com sucesso"});
    });
}

const getRacaById = (req, res) => {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
        return res.status(400).json({erro: "ID inválido"});
    }

    pool.query(queries.getRacaById, [id], (error, results) => {
        if (error) {
            console.error(error);
            return res.status(500).json({erro: "Erro ao consultar raca"});
        }

        if (results.rows.length === 0) {
            return res.status(404).json({erro: "Raca não encontrada"});
        }

        return res.status(200).json(results.rows);
    });
}

const getIdByRaca = (req, res) => {
    const nome = req.params.nome;
    pool.query(racaQueries.getIdByRaca, [nome], (error, results) => {
        if (error) {
            console.error(error);
            return res.status(500).json({erro: "Erro ao consultar ID da raca"});
        }

        if (results.rows.length === 0) {
            return res.status(404).json({erro: "Raca não encontrada pelo ID"});
        }

        return res.status(200).json(results.rows);
    });
}

const updateRaca = (req, res) => {
    const id = parseInt(req.params.id);
    const {nome, especie, peso_min, peso_max, altura_min, altura_max} = req.body;

    if (isNaN(id)) {
        return res.status(400).json({ erro: "ID inválido" });
    }
    
    // Verifica se a raca existe
    pool.query(queries.getRacaById, [id], (error, results) => {
        if (error) {
            console.error(error);
            return res.status(500).json({ erro: "Erro ao consultar raca" });
        }

        if (results.rows.length === 0) {
            return res.status(404).json({ erro: "Raca não encontrada" });
        }

        // Executa o update
        pool.query(queries.updateRaca, [nome, especie, peso_min, peso_max, altura_min, altura_max, id], (error, results) => {
            if (error) {
                console.error(error);
                return res.status(500).json({ erro: "Erro ao atualizar raca" });
            }

            return res.status(200).json({ mensagem: "Raca atualizada com sucesso"});
        });
    });
}

module.exports = {
    getPets,
    getPetById,
    getPetsByUsuario,
    addPet,
    updatePet,
    deletePet,
    uploadFotoPet,
    deleteFotoPet,
    
    getRacas,
    getRacaById,
    getIdByRaca,
    addRaca,
    updateRaca,
};