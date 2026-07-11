const express = require('express');
const router = express.Router();
const petController = require('../controllers/petController');
const racaController = require('../controllers/racaController');
const lembreteController = require('../controllers/lembreteController'); 
const upload = require('../middleware/upload');

router.get('/usuario/:usuarioId', petController.getPetsByUsuario);

//Lembretes

router.post("/lembretes", lembreteController.addLembrete);
router.get("/lembretes/:id", lembreteController.getLembretePet);
router.delete("/lembretes/:id", lembreteController.deleteLembrete);

//Raças
router.get("/raca", racaController.getRacas);
//Adicionar Raca (Somente Dev, não utilizar no app)
router.post("/raca", racaController.addRaca);
//Buscar raça por nome
router.get("/raca/nome/:nome", racaController.getIdByRaca);
//Buscar raça por id
router.get("/raca/:id", racaController.getRacaById);
//Atualizar raça
router.put("/raca/:id", racaController.updateRaca);

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