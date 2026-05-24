const getUsuarios = 'SELECT * FROM Usuarios';
const getUsuarioById = "SELECT * FROM Usuarios WHERE id_usuario = $1";
const checkEmailExists = "SELECT s FROM Usuarios s WHERE s.email = $1";
const addUsuario =  
    "INSERT INTO Usuarios (nome, email, senha) VALUES ($1, $2, $3, $4)";
const deleteUsuario = "DELETE FROM Usuarios WHERE id_usuario = $1";
const updateUsuario = "UPDATE Usuarios SET name = $1 WHERE id_usuario = $2";

module.exports = {
    getUsuarios,
    getUsuarioById,
    checkEmailExists,
    addUsuario,
    deleteUsuario,
    updateUsuario,
};