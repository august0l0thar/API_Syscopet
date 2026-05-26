require('dotenv').config();

const express = require("express");
const cors = require("cors");

const dbRoutes = require('./src/pets/routes');
const app = express();
const PORT = 3000;

app.use(cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type"]
}));

app.use(express.json());

app.get("/", (req, res) => {
    res.send("Hello Cruel World");
});

app.use('/api/v1/usuarios', dbRoutes);

app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));