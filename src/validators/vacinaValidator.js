// Validacoes das regras de negocio do calendario vacinal (sem acesso a banco)

const {parseData, hoje, addDias, formatarData, calcularDataIdadeMinima,} = require('../utils/calendarioCalculator');

const validarCompatibilidadeEspecie = async (pet, template) => {
    if (!template.ativa) {
        return `A vacina "${template.nome}" nao esta ativa no catalogo.`;
    }
    if (template.especie !== 'ambos' && template.especie !== pet.especie) {
        return `A vacina "${template.nome}" nao se aplica a especie "${pet.especie}".`;
    }
    return null;
};

const validarDoseNumero = async (tipo, doseNumero, template) => {
    if (tipo === 'serie') {
        if (!Number.isInteger(doseNumero) || doseNumero < 1 || doseNumero > template.quantidade_doses) {
            return `Dose invalida: a serie de "${template.nome}" tem ${template.quantidade_doses} dose(s).`;
        }
    } else if (tipo === 'reforco') {
        if (!Number.isInteger(doseNumero) || doseNumero < 1) {
            return 'Numero de reforco invalido.';
        }
    } else {
        return `Tipo invalido: "${tipo}". Use "serie" ou "reforco".`;
    }
    return null;
};

const validarRegistroAlvo = async (registro) => {
    if (!registro) {
        return 'Dose nao encontrada no calendario do pet.';
    }
    if (registro.status !== 'pendente') {
        return `Esta dose ja foi ${registro.status === 'aplicada' ? 'aplicada' : 'pulada'}.`;
    }
    return null;
};

const validarDoseAnteriorRegularizada = async (doseAnterior) => {
    if (doseAnterior && doseAnterior.status === 'pendente') {
        return `Regularize a dose ${doseAnterior.dose_numero} antes de prosseguir.`;
    }
    return null;
};

const validarStatus = async (status) => {
    if (!['aplicada', 'pulada'].includes(status)) {
        return `Status invalido para registro: "${status}". Use "aplicada" ou "pulada".`;
    }
    return null;
};

const validarDataAplicacao = async (pet, template, dataAplicacao) => {
    if (dataAplicacao == null) {
        return 'Informe a data de aplicacao.';
    }
    const data = await parseData(dataAplicacao);
    const dataHoje = await hoje();
    if (data > dataHoje) {
        return 'Nao e permitido registrar aplicacao com data futura.';
    }
    const dataMinima = await calcularDataIdadeMinima(pet.data_nascimento, template.idade_minima);
    if (data < dataMinima) {
        const minimaFormatada = await formatarData(dataMinima);
        return `Aplicacao antes da idade minima da vacina (a partir de ${minimaFormatada}).`;
    }
    return null;
};

// Alerta suave: aplicou antes do intervalo recomendado entre doses (nao bloqueia)
const avisoIntervaloMinimo = async (doseAnterior, template, dataAplicacao) => {
    if (!doseAnterior || !doseAnterior.data_aplicacao || !template.intervalo_doses) return null;
    const minima = await addDias(doseAnterior.data_aplicacao, template.intervalo_doses);
    const data = await parseData(dataAplicacao);
    if (data < minima) {
        const minimaFormatada = await formatarData(minima);
        return `Aplicada antes do intervalo recomendado de ${template.intervalo_doses} dias entre doses (minimo em ${minimaFormatada}).`;
    }
    return null;
};

/**
 * Validacao consolidada do registro de dose (aplicada ou pulada).
 * O controller busca pet, template, registroAlvo e doseAnterior no banco
 * e passa tudo aqui. Retorna { valido, erros, avisos }.
 */
const validarRegistroDose = async ({
    pet,
    template,
    tipo = 'serie',
    doseNumero,
    status,
    dataAplicacao,
    registroAlvo,
    doseAnterior,
}) => {
    const erros = [];
    const avisos = [];

    const verificacoes = [
        await validarCompatibilidadeEspecie(pet, template),
        await validarDoseNumero(tipo, doseNumero, template),
        await validarRegistroAlvo(registroAlvo),
        await validarDoseAnteriorRegularizada(doseAnterior),
        await validarStatus(status),
    ];

    if (status === 'aplicada') {
        verificacoes.push(await validarDataAplicacao(pet, template, dataAplicacao));
        const aviso = await avisoIntervaloMinimo(doseAnterior, template, dataAplicacao);
        if (aviso) avisos.push(aviso);
    }

    verificacoes.forEach((erro) => {
        if (erro) erros.push(erro);
    });

    return { valido: erros.length === 0, erros, avisos };
};

// Validacao basica antes de gerar o calendario na criacao do pet
const validarGeracaoCalendario = async (pet) => {
    const erros = [];
    if (!['cao', 'gato'].includes(pet.especie)) {
        erros.push(`Especie invalida para gerar calendario: "${pet.especie}".`);
    }
    if (!pet.data_nascimento) {
        erros.push('O pet precisa de data_nascimento para gerar o calendario vacinal.');
    } else {
        const nascimento = await parseData(pet.data_nascimento);
        const dataHoje = await hoje();
        if (nascimento > dataHoje) {
            erros.push('A data_nascimento do pet nao pode ser futura.');
        }
    }
    return { valido: erros.length === 0, erros };
};

module.exports = {
    validarCompatibilidadeEspecie,
    validarDoseNumero,
    validarRegistroAlvo,
    validarDoseAnteriorRegularizada,
    validarStatus,
    validarDataAplicacao,
    avisoIntervaloMinimo,
    validarRegistroDose,
    validarGeracaoCalendario,
};