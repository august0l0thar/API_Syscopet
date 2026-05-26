const { Router } = require('express');
const controller = require('./controller');
const router = Router();

router.get("/", controller.getUsuario);
router.post("/", controller.addUsuario);
router.post("/login", controller.login);
router.get("/:id", controller.getUsuarioById);
router.put("/:id", controller.updateUsuario);
router.delete("/:id", controller.deleteUsuario);


module.exports = router;