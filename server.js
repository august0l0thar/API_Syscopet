const express = require("express");
const dbRoutes = require('./src/pets/routes');
const app = express();
const PORT = 3000;

app.get(express.json());

app.get("/", (req, res) => {
    res.send("Hello Cruel World");
});

app.use('/api/v1/usuarios', dbRoutes);

app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));