const express = require('express');
const router = express.Router();

const chatController = require('../controllers/chatController');

router.get('/historico/:idUsuario', chatController.buscarHistorico);

router.post('/historico', chatController.salvarMensagens);

router.delete('/historico/:idUsuario', chatController.limparHistorico);

module.exports = router;