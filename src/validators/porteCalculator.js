const pool = require('../../db');
const racaQueries = require('../queries/racaQueries');

// Cache em memória das raças (Map: id -> dados da raça)
let cacheRacas = new Map();
let cacheRacasPorNome = new Map();
let cacheCarregado = false;


// Carrega todas as raças do banco para o cache.
// Chamado apenas uma vez (ou quando for forçado).

const carregarCacheRacas = async () => {
    if (cacheCarregado && cacheRacas.size > 0) {
        return cacheRacas;
    }

    try {
        const result = await pool.query(racaQueries.getRacas);

        // Limpa os caches antes de carregar
        cacheRacas.clear();
        cacheRacasPorNome.clear();

        result.rows.forEach(raca => {
            const idNum = parseInt(raca.id);
            raca.id = idNum;
            cacheRacas.set(raca.id, raca);

            const nomeLower = raca.nome.toLowerCase().trim();
            if (!cacheRacasPorNome.has(nomeLower)) {
                cacheRacasPorNome.set(nomeLower, []);
            }
            cacheRacasPorNome.get(nomeLower).push(raca);
        });
        cacheCarregado = true;
        console.log(`Cache de raças carregado: ${cacheRacas.size} raças`);
        return cacheRacas;
    } catch (error) {
        console.error('Erro ao carregar cache de raças:', error);
        throw error;
    }
};


// Força a recarga do cache (útil após adicionar/atualizar raças)
const invalidarCache = () => {
    cacheRacas.clear();
    cacheCarregado = false;
};


// Busca uma raça pelo ID (primeiro no cache, depois no banco)
const getRaca = async (idRaca) => {
    await carregarCacheRacas();
    return cacheRacas.get(idRaca) || null;
};

const getRacaByNome = async (nome, especie) => {
    await carregarCacheRacas();

    const nomeLower = nome.toLowerCase().trim();
    const racas = cacheRacasPorNome.get(nomeLower);
    
    if (!racas || racas.length === 0) {
        return null;
    }
    
    // Se só tem uma raça com esse nome, retorna direto
    if (racas.length === 1) {
        return racas[0];
    }
    
    // Se tem múltiplas (ex: SRD para cão e gato), filtra pela espécie
    if (especie) {
        const racaEspecie = racas.find(r => r.especie === especie.toLowerCase());
        return racaEspecie || null;
    }

    console.log(racas[0]);

    return racas[0];
}

/**
 * Classifica o porte baseado em uma faixa de peso
 * @returns {string} 'pequeno', 'medio', 'grande', 'gigante'
 */
const classificarPortePorPeso = (peso, pesoMin, pesoMax) => {
    if (peso < pesoMin) return 'pequeno';
    if (peso > pesoMax) return 'grande';
    
    // Se está dentro da faixa, calcula onde ele se encaixa
    const faixa = pesoMax - pesoMin;
    const terco = faixa / 3;
    
    if (peso <= pesoMin + terco) return 'pequeno';
    if (peso <= pesoMin + (terco * 2)) return 'medio';
    return 'grande';
};

/**
 * Calcula o porte e gera alertas de sanidade
 * @param {Object} dados - { peso, altura, id_raca, porte_estimado }
 * @returns {Object} { porte, alerta_saude, dadosRaca }
 */
const calcularPorte = async (dados) => {
    const { peso, altura, id_raca, porte_estimado } = dados;

    // Busca a raça (cache ou banco)
    const raca = await getRaca(id_raca);
    
    if (!raca) {
        throw { status: 404, erro: 'Raça não encontrada' };
    }

    // Verifica se é SRD
    const isSRD = raca.nome.toUpperCase().includes('SRD') && (especie ? raca.especie === especie : true);

    if (isSRD) {
        // ============ CAMINHO 2: SRD ============
        if (!porte_estimado) {
            throw { 
                status: 400, 
                erro: 'Para pets SRD (Sem Raça Definida), o campo "porte_estimado" é obrigatório' 
            };
        }

        // Faixas padrão para SRD
        const faixasSRD = {
            'cao': {
                'pequeno': { min: 1, max: 10 },
                'medio':   { min: 10, max: 25 },
                'grande':  { min: 25, max: 45 },
                'gigante': { min: 45, max: 100 }
            },
            'gato': {
                'pequeno': { min: 1, max: 4 },
                'medio':   { min: 4, max: 7 },
                'grande':  { min: 7, max: 10 },
                'gigante': { min: 10, max: 15 }
            }
        };

        // Valida se a espécie foi informada
        if (!especie) {
            throw { 
                status: 400, 
                erro: 'Para raças SRD, a espécie (cao ou gato) é obrigatória para calcular o porte' 
            };
        }

        const faixasEspecie = faixasSRD[especie.toLowerCase()];

        if (!faixasEspecie) {
            throw { 
                status: 400, 
                erro: 'Espécie inválida para SRD. Use: cao ou gato' 
            };
        }

        const faixaSRD = faixasEspecie[porte_estimado.toLowerCase()];
        if (!faixaSRD) {
            throw { 
                status: 400, 
                erro: 'porte_estimado inválido. Use: pequeno, medio, grande ou gigante' 
            };
        }

        // Compara peso real com a faixa esperada
        let porteFinal = porte_estimado.toLowerCase();
        let alerta = null;

        if (peso < faixaSRD.min) {
            alerta = `O peso (${peso}kg) está abaixo do esperado para um SRD ${porte_estimado} (mínimo: ${faixaSRD.min}kg)`;
        } else if (peso > faixaSRD.max) {
            alerta = `O peso (${peso}kg) está acima do esperado para um SRD ${porte_estimado} (máximo: ${faixaSRD.max}kg). Considere classificar como porte maior.`;
            // Pode reclassificar automaticamente se quiser:
            // porteFinal = classificarPortePorPeso(peso, faixaSRD.min, faixaSRD.max);
        }

        return { 
            porte: porteFinal, 
            alerta_saude: alerta,
            dadosRaca: raca 
        };

    } else {
        // ============ CAMINHO 1: RAÇA DEFINIDA ============
        const { peso_min, peso_max } = raca;

        let porte;
        let alerta = null;

        // Compara peso com a faixa da raça
        if (peso < peso_min) {
            porte = 'pequeno';
            alerta = `ALERTA DE SAÚDE: O peso (${peso}kg) está ABAIXO do padrão da raça ${raca.nome} (${peso_min}kg - ${peso_max}kg). Considere consultar um veterinário.`;
        } else if (peso > peso_max) {
            porte = 'grande';
            alerta = `ALERTA DE SAÚDE: O peso (${peso}kg) está ACIMA do padrão da raça ${raca.nome} (${peso_min}kg - ${peso_max}kg). Considere consultar um veterinário.`;
        } else {
            // Dentro da faixa - calcula o porte relativo
            porte = classificarPortePorPeso(peso, peso_min, peso_max);
        }

        // Validação de sanidade adicional: desvio muito grande
        const desvioPercentual = Math.abs(peso - ((peso_min + peso_max) / 2)) / ((peso_min + peso_max) / 2) * 100;
        if (desvioPercentual > 80) {
            alerta = (alerta ? alerta + ' ' : '') + `Peso está ${desvioPercentual.toFixed(0)}% fora da média da raça.`;
        }

        return { 
            porte, 
            alerta_saude: alerta,
            dadosRaca: raca 
        };
    }
};

module.exports = {
    calcularPorte,
    carregarCacheRacas,
    invalidarCache,
    getRaca,
    getRacaByNome,
};