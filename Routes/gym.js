const express = require("express")
const router = express.Router();
const GymController = require("../Controladores/gym");
const auth = require("../Auth/Auth");

router.post('/login', GymController.login)
router.post('/registrar', GymController.registrar);

module.exports = router;