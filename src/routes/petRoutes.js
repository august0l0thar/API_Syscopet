const express = require('express');
const router = express.Router();
const petController = require('../controllers/petController');
const upload = require('../middleware/upload');

router.get('/usuario/:usuarioId', petController.getPetsByUsuario);

//Raças
router.get("/raca", petController.getRacas);
//Adicionar Raca (Somente Dev, não utilizar no app)
router.post("/raca", petController.addRaca);
//Teste
router.get("/raca/:nome", petController.getIdByRaca);

router.get("/raca/:id", petController.getRacaById);
router.put("/raca/:id", petController.updateRaca);

//pets
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