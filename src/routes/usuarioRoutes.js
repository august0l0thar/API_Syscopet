const { Router } = require('express');
const controller = require('../controllers/usuarioController');
const router = Router();
const rateLimit = require('express-rate-limit');

// == RATE LIMIT  ==
// Limitador específico para Login (ex: X tentativas a cada Y minutos)
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // Apenas 5 tentativas
  message: { 
    erro: "Muitas tentativas de login. Sua conta foi temporariamente bloqueada. Tente novamente em 15 minutos." 
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Limitador específico para Esqueceu a Senha (a fim de evitar spam de e-mails)
const forgotPasswordLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 3, // Apenas 3 solicitações por hora
  message: { 
    erro: "Muitas solicitações de recuperação de senha. Tente novamente em 1 hora." 
  },
  standardHeaders: true,
  legacyHeaders: false,
});

router.post("/login", loginLimiter, controller.login);
router.post('/login-google', controller.loginGoogle);
router.post('/esqueceu-senha', forgotPasswordLimiter, controller.esqueceuSenha);
router.post('/reset-senha', controller.resetSenha);

router.get("/", controller.getUsuario);
router.post("/", controller.addUsuario);

router.get("/:id", controller.getUsuarioById);
router.put("/:id", controller.updateUsuario);
router.delete("/:id", controller.deleteUsuario);

module.exports = router;