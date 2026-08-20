const { Router } = require('express');
const router = Router();
const vacinaController = require("../controllers/vacinaController");


router.post("/", vacinaController.addVacina);

router.get("/", vacinaController.getVacinas);
//router.get("/:id", vacinaController.getVacinaByID);

router.put("/:id", vacinaController.updateVacina);

router.get("/calendario/:petId", vacinaController.getCalendario);
router.post("/registrar-dose", vacinaController.registrarDose);

module.exports = router;
