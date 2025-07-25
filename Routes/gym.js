const express = require("express")
const router = express.Router();
const GymController = require("../Controladores/gym");

router.post('/login',GymController.login)

module.exports = router;