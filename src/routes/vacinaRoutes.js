const { Router } = require('express');
const router = Router();
const vacinaController = require("../controllers/vacinaController");


router.post("/", vacinaController.addVacina);

router.get("/", vacinaController.getVacinas);
//router.get("/:id", vacinaController.getVacinaByID);

router.put("/:id", vacinaController.updateVacina);

module.exports = router;
