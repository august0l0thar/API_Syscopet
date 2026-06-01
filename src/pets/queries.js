const getUsuarios = 'SELECT id, nome FROM usuarios';
const getUsuarioById = "SELECT * FROM usuarios WHERE id = $1";
const checkEmailExists = "SELECT s FROM usuarios s WHERE s.email = $1";
const addUsuario =  
    "INSERT INTO Usuarios (nome, email, senha) VALUES ($1, $2, $3)";
const deleteUsuario = "DELETE FROM usuarios WHERE id = $1";
const updateUsuario = "UPDATE usuarios SET senha = $1 WHERE id = $2";
const getUsuarioByEmail = "SELECT nome, email, senha FROM usuarios WHERE email = $1";

module.exports = {
    getUsuarios,
    getUsuarioById,
    getUsuarioByEmail,
    checkEmailExists,
    addUsuario,
    deleteUsuario,
    updateUsuario,
};