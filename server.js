require('dotenv').config();

const express = require("express");
const cors = require("cors");

const usuarioRoutes = require('./src/routes/usuarioRoutes');
const petRoutes = require('./src/routes/petRoutes');
const app = express();
const PORT = process.env.port || 3000;

app.use(cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type"]
}));

app.use(express.json());

app.get("/", (req, res) => {
    res.send("Hello Cruel World");
});

app.use('/api/v1/usuarios', usuarioRoutes);
app.use('/api/v1/pets', petRoutes);

app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));