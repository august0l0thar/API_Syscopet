// Calculos de datas do calendario vacinal (funcoes sem acesso a banco)

const parseData = async (valor) => {
    if (valor instanceof Date) return new Date(valor);
    const [ano, mes, dia] = String(valor).slice(0, 10).split('-').map(Number);
    return new Date(ano, mes - 1, dia);
};

const normalizarData = async (data) => {
    const d = await parseData(data);
    return new Date(d.getFullYear(), d.getMonth(), d.getDate());
};

const hoje = async () => normalizarData(new Date());

const addDias = async (data, dias) => {
    const d = await normalizarData(data);
    d.setDate(d.getDate() + dias);
    return d;
};

const addSemanas = async (data, semanas) => addDias(data, semanas * 7);

const addMeses = async (data, meses) => {
    const d = await normalizarData(data);
    const diaOriginal = d.getDate();
    d.setMonth(d.getMonth() + meses);
    // Se o dia "virar" o mes (ex: 31/01 + 1 mes), ajusta para o ultimo dia do mes alvo
    if (d.getDate() !== diaOriginal) d.setDate(0);
    return d;
};

const formatarData = async (data) => {
    const d = await normalizarData(data);
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    return `${dd}/${mm}/${d.getFullYear()}`;
};

// ----- Regras de negocio -----

// Data em que o pet atinge a idade minima da vacina
const calcularDataIdadeMinima = async (dataNascimento, idadeMinimaSemanas) =>
    addSemanas(dataNascimento, idadeMinimaSemanas);

// 1a dose: idade minima, mas nunca no passado (pet que ja passou da idade)
const calcularDataPrimeiraDose = async (dataNascimento, idadeMinimaSemanas, dataReferencia = null) => {
    const referencia = dataReferencia ? await normalizarData(dataReferencia) : await hoje();
    const dataMinima = await calcularDataIdadeMinima(dataNascimento, idadeMinimaSemanas);
    return dataMinima < referencia ? referencia : dataMinima;
};

// Datas previstas da serie inicial (1..quantidade_doses)
const calcularSerieDatas = async (dataNascimento, template, dataReferencia = null) => {
    const intervalo = template.intervalo_doses || 0;
    const datas = [];
    let data = await calcularDataPrimeiraDose(dataNascimento, template.idade_minima, dataReferencia);
    for (let dose = 1; dose <= template.quantidade_doses; dose++) {
        datas.push(data);
        data = await addDias(data, intervalo);
    }
    return datas;
};

// Reprograma as doses pendentes restantes ancoradas na data real da aplicacao
const calcularReprogramacao = async (dataAplicacao, intervaloDias, quantidadeRestante) => {
    const datas = [];
    let data = await normalizarData(dataAplicacao);
    for (let i = 0; i < quantidadeRestante; i++) {
        data = await addDias(data, intervaloDias || 0);
        datas.push(data);
    }
    return datas;
};

// Proximo reforco conforme o template (null se a vacina nao tem reforco)
const calcularProximoReforco = async (dataAplicacao, intervaloReforcoMeses) => {
    if (intervaloReforcoMeses == null) return null;
    return addMeses(dataAplicacao, intervaloReforcoMeses);
};

// Para listagem: registro pendente com data prevista ja passada
const estaAtrasada = async (registro, dataReferencia = null) => {
    const referencia = dataReferencia ? await normalizarData(dataReferencia) : await hoje();
    const prevista = await normalizarData(registro.data_prevista);
    return registro.status === 'pendente' && prevista < referencia;
};

module.exports = {
    parseData,
    normalizarData,
    hoje,
    addDias,
    addSemanas,
    addMeses,
    formatarData,
    calcularDataIdadeMinima,
    calcularDataPrimeiraDose,
    calcularSerieDatas,
    calcularReprogramacao,
    calcularProximoReforco,
    estaAtrasada,
};