// == IMPORTAÇÕES ==
require('dotenv').config();

const express = require("express");
const cors = require("cors");
// Biblioteca de rate limiting das requisições
const rateLimit = require('express-rate-limit');

const usuarioRoutes = require('./src/routes/usuarioRoutes');
const petRoutes = require('./src/routes/petRoutes');
const vacinaRoutes = require('./src/routes/vacinaRoutes');

// == INICIALIZAÇÃO DO APP ==
const app = express();
const PORT = process.env.port || 3000;

// == MIDDLEWARES GLOBAIS ==
app.set('trust proxy', 1);

app.use(cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type"]
}));

app.use(express.json());

// == SEGURANÇA ==

// Limitador global para requisições
const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // Janela de tempo: 15 minutos
    max: 100, // Limite: 100 requisições por IP a cada 15 minutos
    message: { 
        erro: "Muitas requisições deste IP. Por favor, tente novamente em 15 minutos." 
    },
    standardHeaders: true, // Retorna informações de limite nos cabeçalhos `RateLimit-*`
    legacyHeaders: false,  // Desativa os cabeçalhos antigos `X-RateLimit-*`
});

app.use(globalLimiter);

// == ROTAS DA API ==

app.get("/", (req, res) => {
    res.json({ 
        mensagem: "API SyscoPet está rodando com sucesso! Fuck Yeah!!",
        versao: "v1"
    });
});

app.use('/api/v1/usuarios', usuarioRoutes);
app.use('/api/v1/pets', petRoutes);
app.use('/api/v1/vacinas', vacinaRoutes);

app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));