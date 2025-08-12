// Rutas/miembros.js
const express = require("express");
const router = express.Router();
const MiembrosController = require("../Controladores/miembros");
const auth = require("../Auth/Auth");

// Endpoints nuevos sugeridos
router.get("/miembros", auth, MiembrosController.getAllMiembros);
router.get("/miembros/:id", auth, MiembrosController.verMiembro);
router.post("/miembros", auth, MiembrosController.registroMiembros);
router.put('/miembros/:id', auth, MiembrosController.actualizarMiembro);
router.post('/miembros/:id/renovar', auth, MiembrosController.renovarMiembro);

// Compatibilidad con rutas existentes
router.post("/registrarmiembros", auth, MiembrosController.registroMiembros);
router.patch('/actualizarmiembro/:id', auth, MiembrosController.actualizarMiembro);
router.delete("/eliminarmiembro/:id", auth, MiembrosController.eliminarMiembro);

module.exports = router;
