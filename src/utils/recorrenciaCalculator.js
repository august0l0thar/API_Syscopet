/**
 * Calcula a próxima data de ocorrência baseado na recorrência
 * @param {Date} dataBase - Data base do lembrete
 * @param {string} tipoRecorrencia - 'unica', 'diaria', 'semanal', 'mensal', 'outro'
 * @param {boolean} ativo - Se o lembrete está ativo
 * @returns {Date|null} Próxima data ou null se não houver mais ocorrências
 */
const calcularProximaOcorrencia = (dataBase, tipoRecorrencia, ativo = true) => {
    const agora = new Date();
    const data = new Date(dataBase);

    // Se não está ativo, não calcula próximas ocorrências
    if (!ativo) {
        return null;
    }

    // Se a data base já passou, calcula a próxima a partir de agora
    const dataInicio = data < agora ? agora : data;

    switch (tipoRecorrencia) {
        case 'unica':
            // Se já passou, não tem próxima ocorrência
            return data > agora ? data : null;

        case 'diaria':
            // Próximo dia à mesma hora
            const proximoDia = new Date(dataInicio);
            proximoDia.setDate(proximoDia.getDate() + 1);
            return proximoDia;

        case 'semanal':
            // A partir de 7 dias (conforme regra de negócio)
            const proximaSemana = new Date(dataInicio);
            proximaSemana.setDate(proximaSemana.getDate() + 7);
            return proximaSemana;

        case 'mensal':
            // A partir de 30 dias (conforme regra de negócio)
            const proximoMes = new Date(dataInicio);
            proximoMes.setDate(proximoMes.getDate() + 30);
            return proximoMes;

        case 'outro':
            // Para "outro", você pode definir uma lógica customizada
            // Por exemplo, a cada 15 dias
            const proximoOutro = new Date(dataInicio);
            proximoOutro.setDate(proximoOutro.getDate() + 15);
            return proximoOutro;

        default:
            return null;
    }
};

/**
 * Calcula as próximas N ocorrências de um lembrete
 * @param {Date} dataBase - Data base do lembrete
 * @param {string} tipoRecorrencia - Tipo de recorrência
 * @param {boolean} ativo - Se está ativo
 * @param {number} quantidade - Quantas ocorrências calcular (padrão: 10)
 * @returns {Date[]} Array com as próximas datas
 */
const calcularProximasOcorrencias = (dataBase, tipoRecorrencia, ativo = true, quantidade = 10) => {
    const ocorrencias = [];
    let dataAtual = new Date(dataBase);

    // Se não está ativo, retorna vazio
    if (!ativo) {
        return [];
    }

    for (let i = 0; i < quantidade; i++) {
        const proxima = calcularProximaOcorrencia(dataAtual, tipoRecorrencia, ativo);
        
        if (!proxima) {
            break; // Não há mais ocorrências
        }

        ocorrencias.push(proxima);
        dataAtual = proxima;
    }

    return ocorrencias;
};

module.exports = {
    calcularProximaOcorrencia,
    calcularProximasOcorrencias
};