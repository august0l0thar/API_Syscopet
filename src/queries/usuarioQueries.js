const getUsuarios = 'SELECT id, nome FROM usuarios';
const getUsuarioById = "SELECT * FROM usuarios WHERE id = $1";
const checkEmailExists = "SELECT s FROM usuarios s WHERE s.email = $1";
const addUsuario =  
    "INSERT INTO Usuarios (nome, email, senha) VALUES ($1, $2, $3)";
const deleteUsuario = "DELETE FROM usuarios WHERE id = $1";
const updateUsuario = "UPDATE usuarios SET senha = $1 WHERE id = $2";
const getUsuarioByEmail = "SELECT id, nome, email, senha FROM usuarios WHERE email = $1";

//queries para recuperação de senha
const getUsuarioIdByEmail = "SELECT id FROM usuarios WHERE email = $1";
const updateResetToken = "UPDATE usuarios SET reset_token = $1, reset_token_expira_em = $2 WHERE email = $3";
const getUsuarioWithToken = "SELECT id, email, reset_token, reset_token_expira_em FROM usuarios WHERE email = $1";
const clearResetToken = "UPDATE usuarios SET reset_token = NULL, reset_token_expira_em = NULL WHERE id = $1";

module.exports = {
    getUsuarios,
    getUsuarioById,
    getUsuarioByEmail,
    checkEmailExists,
    addUsuario,
    deleteUsuario,
    updateUsuario,
    getUsuarioIdByEmail,
    updateResetToken,
    getUsuarioWithToken,
    clearResetToken,
};