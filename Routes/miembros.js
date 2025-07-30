const express = require("express")
const router = express.Router();
const MiembrosController = require("../Controladores/miembros");
const auth = require("../Auth/Auth");

router.get('/miembros', auth, MiembrosController.getAllMiembros);
router.post('/registrarmiembros', auth, MiembrosController.registroMiembros);

module.exports = router;