const express = require("express");
const router = express.Router();
const EntrenadorController = require("../Controladores/entrenador");
const auth = require("../Auth/Auth");

// Crear entrenador
router.post("/nuevo", auth, EntrenadorController.crearEntrenador);

// Ver entrenadores
router.get("/ver", auth, EntrenadorController.verEntrenadores);

// Eliminar entrenador
router.delete("/eliminar/:id", auth, EntrenadorController.eliminarEntrenador);

module.exports = router;
