const pool = require('../../db');

const petQueries = require("../queries/petQueries");
const vacinaQueries = require("../queries/vacinaQueries");

const calendarioCalculator = require("../utils/calendarioCalculator");
const { validarRegistroDose, validarGeracaoCalendario } = require("../validators/vacinaValidator");

const getVacinas = (req, res) => {
    const { especie } = req.query;

    if(!especie){
        pool.query(vacinaQueries.getVacinas, (error, results) => {
            if (error) {
                console.error(error);
                return res.status(500).json({erro: "Erro ao buscar todas as vacinas"});
            }
            return res.status(200).json(results.rows);
        }); 
        return;
    }

    const especiesValidas = ['cao', 'gato'];
    if (!especiesValidas.includes(especie.toLowerCase())) {
        return res.status(400).json({ 
            erro: `Espécie inválida. Valores permitidos: ${especiesValidas.join(', ')}` 
        });
    }

    pool.query(vacinaQueries.getVacinasByEspecie, [especie.toLowerCase()], (error, results) => {
        if (error) {
            console.error(error);
            return res.status(500).json({ erro: `Erro ao buscar vacinas para ${especie}s` });
        }
        return res.status(200).json(results.rows);
    });
};

const addVacina = (req, res) => {
    const {nome, doenca_protegida, especie, obrigatoria, essencial, idade_minima, quantidade_doses, 
           intervalo_doses, intervalo_reforco, ativa} = req.body;

    const dados = [
        nome, 
        doenca_protegida, 
        especie, 
        obrigatoria, 
        essencial, 
        idade_minima, 
        quantidade_doses, 
        intervalo_doses, 
        intervalo_reforco, 
        ativa
    ];

    pool.query(vacinaQueries.addVacina, dados, (error, results) => {
        if (error) {
            console.error(error);
            return res.status(500).json({erro: "Erro ao cadastrar vacina"});
        }
        console.log("Vacina Cadastrada: ", nome);
        return res.status(200).json({message: "Vacina Cadastrada com sucesso"});
    });
};

const updateVacina = (req, res) => {
    const id = parseInt(req.params.id);
    const {nome, doenca_protegida, especie, obrigatoria, essencial, idade_minima, quantidade_doses, 
           intervalo_doses, intervalo_reforco, ativa} = req.body;

    if (isNaN(id)) {
        return res.status(400).json({ erro: "ID inválido" });
    }

    const dados = [
        nome, 
        doenca_protegida, 
        especie, 
        obrigatoria, 
        essencial, 
        idade_minima, 
        quantidade_doses, 
        intervalo_doses, 
        intervalo_reforco, 
        ativa,
        id
    ];
    
    // Verifica se a vacina existe
    pool.query(vacinaQueries.getVacinaByID, [id], (error, results) => {
        if (error) {
            console.error(error);
            return res.status(500).json({ erro: "Erro ao consultar vacina" });
        }

        if (results.rows.length === 0) {
            return res.status(404).json({ erro: "Vacina não encontrada" });
        }

        // Executa o update
        pool.query(vacinaQueries.updateVacina, dados, (error, results) => {
            if (error) {
                console.error(error);
                return res.status(500).json({ erro: "Erro ao atualizar vacina" });
            }

            return res.status(200).json({ mensagem: "Vacina atualizada com sucesso"});
        });
    });
};

const gerarCalendarioPet = async (pet) => {
    const validacao = await validarGeracaoCalendario(pet);
    if (!validacao.valido) {
        console.error("Erro ao gerar calendário:", validacao.erros);
        return;
    }

    try {
        const { rows: templates } = await pool.query(vacinaQueries.getTemplatesAtivos, [pet.especie]);

        for (const template of templates) {
            const datas = await calendarioCalculator.calcularSerieDatas(pet.data_nascimento, template, new Date());
            for (let i = 0; i < datas.length; i++) {
                await pool.query(vacinaQueries.insertDose, [pet.id, template.id, i + 1, datas[i], 'serie']);
            }
        }
        console.log(`Calendário de vacinas gerado para o pet ${pet.id}`);
    } catch (err) {
        console.error("Erro ao gerar calendário de vacinas:", err);
    }
};

// ===== LISTAGEM DE CALENDÁRIO =====
const getCalendario = (req, res) => {
    const petId = parseInt(req.params.petId);
    if (isNaN(petId)) {
        return res.status(400).json({ erro: "ID do pet inválido" });
    }

    pool.query(vacinaQueries.getCalendarioByPet, [petId], async (error, results) => {
        if (error) {
            console.error(error);
            return res.status(500).json({ erro: "Erro ao buscar calendário" });
        }

        // Adiciona flag "atrasada" em cada registro
        const calendario = [];
        for (const row of results.rows) {
            const atrasada = await calendarioCalculator.estaAtrasada(row);
            calendario.push({ ...row, atrasada });
        }

        return res.status(200).json(calendario);
    });
};

// ===== REGISTRAR DOSE (aplicada ou pulada) =====
const registrarDose = async (req, res) => {
    try {
        const { id_pet, vacina_template_id, dose_numero, status, data_aplicacao, tipo = 'serie' } = req.body;

        if (!id_pet || !vacina_template_id || !dose_numero || !status) {
            return res.status(400).json({ erro: "Campos obrigatórios: id_pet, vacina_template_id, dose_numero, status" });
        }

        // Busca pet
        const petResult = await pool.query(petQueries.getPetById, [id_pet]);
        if (petResult.rows.length === 0) {
            return res.status(404).json({ erro: "Pet não encontrado" });
        }
        const pet = petResult.rows[0];

        // Busca template
        const templateResult = await pool.query(vacinaQueries.getVacinaById, [vacina_template_id]);
        if (templateResult.rows.length === 0) {
            return res.status(404).json({ erro: "Vacina não encontrada no catálogo" });
        }
        const template = templateResult.rows[0];

        // Busca registro alvo
        const registroResult = await pool.query(vacinaQueries.getDosePendente, [
            id_pet, vacina_template_id, dose_numero, tipo
        ]);
        const registroAlvo = registroResult.rows[0] || null;

        // Busca dose anterior (para validar ordem)
        const doseAnteriorNum = dose_numero - 1;
        const doseAnteriorResult = doseAnteriorNum > 0 
            ? await pool.query(vacinaQueries.getDoseAnterior, [id_pet, vacina_template_id, doseAnteriorNum, tipo])
            : { rows: [] };
        const doseAnterior = doseAnteriorResult.rows[0] || null;

        // Validação consolidada
        const validacao = await validarRegistroDose({
            pet, template, tipo, dose_numero, status, data_aplicacao, registroAlvo, doseAnterior,
        });

        if (!validacao.valido) {
            return res.status(400).json({ erros: validacao.erros });
        }

        if (status === 'aplicada') {
            // Marcar como aplicada e calcular próximo reforço
            let proximo_reforco = null;
            const ehUltimaDose = (tipo === 'serie' && dose_numero === template.quantidade_doses) || tipo === 'reforco';
            
            if (ehUltimaDose && template.intervalo_reforco != null) {
                proximo_reforco = await calendarioCalculator.calcularProximoReforco(
                    data_aplicacao, 
                    template.intervalo_reforco
                );
            }

            await pool.query(vacinaQueries.updateDoseAplicada, [
                'aplicada', data_aplicacao, proximo_reforco, registroAlvo.id
            ]);

            // Se é última da série ou reforço, cria o próximo reforço como pendente
            if (ehUltimaDose && proximo_reforco) {
                await pool.query(vacinaQueries.insertDose, [
                    id_pet, vacina_template_id, 1, proximo_reforco, 'reforco'
                ]);
            }

            // Reprograma as próximas doses da série ancoradas na data real
            if (tipo === 'serie' && dose_numero < template.quantidade_doses) {
                const dosesRestantes = template.quantidade_doses - dose_numero;
                const novasDatas = await calendarioCalculator.calcularReprogramacao(
                    data_aplicacao, 
                    template.intervalo_doses, 
                    dosesRestantes
                );
                for (let i = 0; i < dosesRestantes; i++) {
                    const proxDoseNum = dose_numero + 1 + i;
                    const proxResult = await pool.query(vacinaQueries.getDosePendente, [
                        id_pet, vacina_template_id, proxDoseNum, 'serie'
                    ]);
                    if (proxResult.rows.length > 0) {
                        await pool.query(vacinaQueries.updateDataPrevista, [
                            novasDatas[i], proxResult.rows[0].id
                        ]);
                    }
                }
            }

            return res.status(200).json({ 
                mensagem: "Dose registrada como aplicada", 
                avisos: validacao.avisos,
                proximo_reforco 
            });

        } else { // status === 'pulada'
            await pool.query(vacinaQueries.updateDoseAplicada, [
                'pulada', null, null, registroAlvo.id
            ]);

            return res.status(200).json({ 
                mensagem: "Dose marcada como pulada",
                avisos: validacao.avisos 
            });
        }
    } catch (err) {
        console.error("Erro ao registrar dose:", err);
        return res.status(500).json({ erro: "Erro interno do servidor" });
    }
};

module.exports = {
    getVacinas,
    addVacina,
    updateVacina,
    gerarCalendarioPet,
    getCalendario,
    registrarDose,
};