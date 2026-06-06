const express = require('express');
const router = express.Router();
const petController = require('../controllers/petController');
const upload = require('../middleware/upload');

router.get('/usuario/:usuarioId', petController.getPetsByUsuario);

router.get("/", petController.getPets);
router.post("/", petController.addPet);
router.get("/:id", petController.getPetById);
router.put("/:id", petController.updatePet);
router.delete("/:id", petController.deletePet);

//Upload de foto
router.post(
  '/:id/photo',
  upload.single('photo'), // 'photo' é o nome do campo no form-data
  petController.uploadFotoPet
);

//Remover foto
router.delete(
  '/:id/photo',
  petController.deleteFotoPet
);

module.exports = router;