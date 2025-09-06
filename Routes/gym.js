const express = require("express")
const router = express.Router();
const GymController = require("../Controladores/gym");

router.post('/loginadmin', GymController.login)
router.post('/registraradmin', GymController.registrar);

module.exports = router;