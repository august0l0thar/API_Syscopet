const { Router } = require('express');
const controller = require('./controller');
const router = Router();

router.get("/", controller.getUsuario);
router.post("/", controller.addUsuario);
router.get("/:id", controller.getUsuarioById);
router.put("/:id", controller.updateUsuario);
router.delete("/:id", controller.deleteUsuario);

router.post("login", controller.login);

module.exports = router;