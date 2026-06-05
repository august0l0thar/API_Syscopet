const { Router } = require('express');
const petController = require('../controllers/petController');
const router = Router();

router.get("/", petController.getPets);
router.post("/", petController.addPet);
router.get("/:id", petController.getPetById);
router.put("/:id", petController.updatePet);
router.delete("/:id", petController.deletePet);

module.exports = router;