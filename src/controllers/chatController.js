const chatQueries = require('../queries/chatQueries');

// Buscar histórico de mensagens de um usuário
async function buscarHistorico(req, res) {
    try {
        const idUsuario = Number(req.params.idUsuario);

        if (!Number.isInteger(idUsuario) || idUsuario <= 0) {
            return res.status(400).json({
                sucesso: false,
                erro: 'ID de usuário inválido'
            });
        }

        const mensagens = await chatQueries.buscarHistorico(idUsuario);

        return res.status(200).json({
            sucesso: true,
            mensagens
        });

    } catch (erro) {
        console.error('Erro ao buscar histórico:', erro);

        return res.status(500).json({
            sucesso: false,
            erro: 'Erro ao buscar histórico do chat'
        });
    }
}


// Salvar pergunta do usuário e resposta do assistente
async function salvarMensagens(req, res) {
    try {
        const { id_usuario, pergunta, resposta } = req.body;

        const idUsuario = Number(id_usuario);

        // Validar ID do usuário
        if (!Number.isInteger(idUsuario) || idUsuario <= 0) {
            return res.status(400).json({
                sucesso: false,
                erro: 'ID de usuário inválido'
            });
        }

        // Validar pergunta e resposta
        if (
            typeof pergunta !== 'string' ||
            !pergunta.trim() ||
            typeof resposta !== 'string' ||
            !resposta.trim()
        ) {
            return res.status(400).json({
                sucesso: false,
                erro: 'Pergunta e resposta são obrigatórias'
            });
        }

        // Salvar pergunta do usuário
        const mensagemUsuario = await chatQueries.salvarMensagem(
            idUsuario,
            'user',
            pergunta.trim()
        );

        // Salvar resposta do assistente
        const mensagemAssistente = await chatQueries.salvarMensagem(
            idUsuario,
            'assistant',
            resposta.trim()
        );

        return res.status(201).json({
            sucesso: true,
            mensagens: [
                mensagemUsuario,
                mensagemAssistente
            ]
        });

    } catch (erro) {
        console.error('Erro ao salvar mensagens:', erro);

        return res.status(500).json({
            sucesso: false,
            erro: 'Erro ao salvar mensagens no histórico'
        });
    }
}


// Limpar histórico de um usuário
async function limparHistorico(req, res) {
    try {
        const idUsuario = Number(req.params.idUsuario);

        if (!Number.isInteger(idUsuario) || idUsuario <= 0) {
            return res.status(400).json({
                sucesso: false,
                erro: 'ID de usuário inválido'
            });
        }

        await chatQueries.limparHistorico(idUsuario);

        return res.status(200).json({
            sucesso: true,
            mensagem: 'Histórico excluído com sucesso'
        });

    } catch (erro) {
        console.error('Erro ao limpar histórico:', erro);

        return res.status(500).json({
            sucesso: false,
            erro: 'Erro ao limpar histórico'
        });
    }
}


module.exports = {
    buscarHistorico,
    salvarMensagens,
    limparHistorico
};
