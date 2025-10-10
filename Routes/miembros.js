const express = require("express");
const router = express.Router();
const MiembrosController = require("../Controladores/miembros");
const authUnificado = require("../Middleware/authUnificado");

// CRUD principal
router.get("/miembros", authUnificado, MiembrosController.getAllMiembros);
router.post("/miembros", authUnificado, MiembrosController.registroMiembros);
router.get("/miembros/:id", authUnificado, MiembrosController.verMiembro);
router.put("/miembros/:id", authUnificado, MiembrosController.actualizarMiembro);
router.delete("/miembros/:id", authUnificado, MiembrosController.eliminarMiembro);

// Acción especial: renovar membresía
router.post("/miembros/:id/renovar", authUnificado, MiembrosController.renovarMiembro);

module.exports = router;
