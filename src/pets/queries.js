const getUsuarios = 'SELECT * FROM usuarios';
const getUsuarioById = "SELECT * FROM usuarios WHERE id_usuario = $1";
const checkEmailExists = "SELECT s FROM usuarios s WHERE s.email = $1";
const addUsuario =  
    "INSERT INTO Usuarios (nome, email, senha, criado_em) VALUES ($1, $2, $3, $4)";
const deleteUsuario = "DELETE FROM usuarios WHERE id_usuario = $1";
const updateUsuario = "UPDATE usuarios SET nome = $1 WHERE id_usuario = $2";
const getUsuarioByEmail = "SELECT id_usuario FROM usuarios WHERE id_usuario = $1";

module.exports = {
    getUsuarios,
    getUsuarioById,
    getUsuarioByEmail,
    checkEmailExists,
    addUsuario,
    deleteUsuario,
    updateUsuario,
};