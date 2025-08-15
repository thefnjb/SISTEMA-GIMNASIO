// Rutas/miembros.js
const express = require("express");
const router = express.Router();
const MiembrosController = require("../Controladores/miembros");
const auth = require("../Auth/Auth");

router.get("/miembros", auth, MiembrosController.getAllMiembros);
router.post("/miembros", auth, MiembrosController.registroMiembros);
router.put('/miembros/:id', auth, MiembrosController.actualizarMiembro);
router.post('/miembros/:id/renovar', auth, MiembrosController.renovarMiembro);
router.get("/miembros/:id", auth, MiembrosController.verMiembro);
router.post("/registrarmiembros", auth, MiembrosController.registroMiembros);
router.patch('/actualizarmiembro/:id', auth, MiembrosController.actualizarMiembro);
router.delete("/eliminarmiembro/:id", auth, MiembrosController.eliminarMiembro);

module.exports = router;