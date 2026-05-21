const pool = require('../../db');

const getUsuario = (req, res) => {
    pool.query('SELECT * FROM Usuarios', (error, results) => {
        if (error) throw error;
        res.status(200).json(results.rows);
    })
}

module.exports = {
    getUsuario,
};