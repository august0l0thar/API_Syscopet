const { Router } = require('express');
const controller = require('../controllers/usuarioController');
const router = Router();

router.get("/", controller.getUsuario);
router.post("/", controller.addUsuario);
router.post("/login", controller.login);
router.post('/login-google', controller.loginGoogle);
router.get("/:id", controller.getUsuarioById);
router.put("/:id", controller.updateUsuario);
router.delete("/:id", controller.deleteUsuario);

router.post('/esqueceu-senha', controller.esqueceuSenha);
router.post('/reset-senha', controller.resetSenha);

module.exports = router;