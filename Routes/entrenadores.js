const express = require("express");
const router = express.Router();
const EntrenadorController = require("../Controladores/entrenador");
const auth = require("../Auth/Auth");
const upload = require("../Middleware/multerConfig");

// Crear entrenador (subida de imagen en memoria)
router.post("/nuevo", auth, upload.single("fotoPerfil"), EntrenadorController.crearEntrenador);

// Ver entrenadores
router.get("/ver", auth, EntrenadorController.verEntrenadores);

// Eliminar entrenador
router.delete("/eliminar/:id", auth, EntrenadorController.eliminarEntrenador);

module.exports = router;
