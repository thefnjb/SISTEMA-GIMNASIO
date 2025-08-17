// Rutas/miembros.js
const express = require("express");
const router = express.Router();
const MiembrosController = require("../Controladores/miembros");
const auth = require("../Auth/Auth");

// CRUD principal
router.get("/miembros", auth, MiembrosController.getAllMiembros);
router.post("/miembros", auth, MiembrosController.registroMiembros);
router.get("/miembros/:id", auth, MiembrosController.verMiembro);
router.put("/miembros/:id", auth, MiembrosController.actualizarMiembro);
router.delete("/miembros/:id", auth, MiembrosController.eliminarMiembro);

// Acción especial: renovar membresía
router.post("/miembros/:id/renovar", auth, MiembrosController.renovarMiembro);

module.exports = router;
