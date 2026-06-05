// Valores permitidos para o ENUM especie
const ESPECIES_VALIDAS = ['cao', 'gato', 'outro'];


//Validação da espécie do pet
 
const validarEspecie = (especie) => {
    if (!especie) return { valido: true }; // opcional no update
    
    if (typeof especie !== 'string') {
        return { valido: false, erro: 'Espécie deve ser uma string' };
    }
    
    const especieNormalizada = especie.toLowerCase().trim();
    if (!ESPECIES_VALIDAS.includes(especieNormalizada)) {
        return { 
            valido: false, 
            erro: `Espécie inválida. Valores permitidos: ${ESPECIES_VALIDAS.join(', ')}` 
        };
    }
    
    return { valido: true, valor: especieNormalizada };
};


//Validação da data de nascimento
 
const validarDataNascimento = (data) => {
    if (data === undefined || data === null || data === '') {
        return { valido: true }; // opcional
    }
    
    if (typeof data !== 'string') {
        return { valido: false, erro: 'Data de nascimento deve ser uma string' };
    }
    
    // Regex para validar formatos parciais
    const regexAno = /^\d{4}$/;
    const regexAnoMes = /^\d{4}-(0[1-9]|1[0-2])$/;
    const regexCompleta = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/;
    
    let dataCompleta = data;
    
    if (regexAno.test(data)) {
        // Só ano: completa com 01-01
        dataCompleta = `${data}-01-01`;
    } else if (regexAnoMes.test(data)) {
        // Ano-mês: completa com dia 01
        dataCompleta = `${data}-01`;
    } else if (!regexCompleta.test(data)) {
        return { 
            valido: false, 
            erro: 'Data inválida. Use formato: YYYY, YYYY-MM ou YYYY-MM-DD' 
        };
    }
    
    // Verifica se a data é válida e não é futura
    const dataObj = new Date(dataCompleta);
    if (isNaN(dataObj.getTime())) {
        return { valido: false, erro: 'Data de nascimento inválida' };
    }
    
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    
    if (dataObj > hoje) {
        return { valido: false, erro: 'Data de nascimento não pode ser futura' };
    }
    
    return { valido: true, valor: dataCompleta };
};


//Validação do peso

const validarPeso = (peso, obrigatorio = false) => {
    if (peso === undefined || peso === null || peso === '') {
        if (obrigatorio) {
            return { valido: false, erro: 'Peso é obrigatório' };
        }
        return { valido: true };
    }
    
    const pesoNum = Number(peso);
    
    if (isNaN(pesoNum)) {
        return { valido: false, erro: 'Peso deve ser um número' };
    }
    
    if (pesoNum <= 0) {
        return { valido: false, erro: 'Peso deve ser maior que zero' };
    }
    
    if (pesoNum >= 200) {
        return { valido: false, erro: 'Peso deve ser menor que 200 kg' };
    }
    
    // Arredonda para 2 casas decimais
    const pesoArredondado = Math.round(pesoNum * 100) / 100;
    
    return { valido: true, valor: pesoArredondado };
};

//Validação da altura

const validarAltura = (altura) => {
    if (altura === undefined || altura === null || altura === '') {
        return { valido: true }; // opcional
    }
    
    const alturaNum = Number(altura);
    
    if (isNaN(alturaNum)) {
        return { valido: false, erro: 'Altura deve ser um número' };
    }
    
    if (alturaNum <= 0) {
        return { valido: false, erro: 'Altura deve ser maior que zero' };
    }
    
    if (alturaNum >= 1000) {
        return { valido: false, erro: 'Altura deve ser menor que 1000 cm' };
    }
    
    // Arredonda para 1 casa decimal
    const alturaArredondada = Math.round(alturaNum * 10) / 10;
    
    return { valido: true, valor: alturaArredondada };
};

/** Valida todos os campos do pet de uma vez
 * @param {Object} dados - Objeto com os dados do pet
 * @param {boolean} isUpdate - true se for update (campos opcionais), false se for create*/

const validarPet = (dados, isUpdate = false) => {
    const erros = [];
    const dadosValidados = {};
    
    // Valida espécie
    if (dados.especie !== undefined) {
        const validacao = validarEspecie(dados.especie);
        if (!validacao.valido) {
            erros.push(validacao.erro);
        } else if (validacao.valor) {
            dadosValidados.especie = validacao.valor;
        }
    }
    
    // Valida data de nascimento
    if (dados.data_nascimento !== undefined) {
        const validacao = validarDataNascimento(dados.data_nascimento);
        if (!validacao.valido) {
            erros.push(validacao.erro);
        } else if (validacao.valor) {
            dadosValidados.data_nascimento = validacao.valor;
        }
    }
    
    // Valida peso (obrigatório apenas no create)
    const validacaoPeso = validarPeso(dados.peso, !isUpdate);
    if (!validacaoPeso.valido) {
        erros.push(validacaoPeso.erro);
    } else if (validacaoPeso.valor !== undefined) {
        dadosValidados.peso = validacaoPeso.valor;
    }
    
    // Valida altura
    if (dados.altura !== undefined) {
        const validacao = validarAltura(dados.altura);
        if (!validacao.valido) {
            erros.push(validacao.erro);
        } else if (validacao.valor !== undefined) {
            dadosValidados.altura = validacao.valor;
        }
    }
    
    // Valida nome (se existir)
    if (dados.nome !== undefined) {
        if (!dados.nome || typeof dados.nome !== 'string' || dados.nome.trim() === '') {
            erros.push('Nome é obrigatório e deve ser uma string não vazia');
        } else {
            dadosValidados.nome = dados.nome.trim();
        }
    }
    
    // Valida porte (se existir)
    if (dados.porte !== undefined) {
        const portesValidos = ['pequeno', 'medio', 'grande'];
        if (!portesValidos.includes(dados.porte.toLowerCase())) {
            erros.push(`Porte inválido. Valores permitidos: ${portesValidos.join(', ')}`);
        } else {
            dadosValidados.porte = dados.porte.toLowerCase();
        }
    }
    
    return {
        valido: erros.length === 0,
        erros,
        dados: dadosValidados
    };
};

module.exports = {
    validarPet,
    validarEspecie,
    validarDataNascimento,
    validarPeso,
    validarAltura
};