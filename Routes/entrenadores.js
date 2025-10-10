const express = require("express");
const router = express.Router();
const EntrenadorController = require("../Controladores/entrenador");
const authAdmin = require('../Middleware/authAdmin');
const authUnificado = require('../Middleware/authUnificado'); // ✅ Importar authUnificado
const upload = require("../middleware/multerConfig");

// ✅ SOLO ADMIN puede crear, actualizar y eliminar entrenadores
router.post("/nuevo", authAdmin, upload.single("fotoPerfil"), EntrenadorController.crearEntrenador);
router.put("/actualizar/:id", authAdmin, EntrenadorController.actualizarEntrenador);
router.delete("/eliminar/:id", authAdmin, EntrenadorController.eliminarEntrenador);

// ✅ ADMIN Y TRABAJADOR pueden VER los entrenadores (usando authUnificado)
router.get("/ver", authUnificado, EntrenadorController.verEntrenadores);

// ✅ Esta ruta puede quedar sin autenticación si es para mostrar fotos públicamente
router.get("/ver/:id/photo", EntrenadorController.verFotoPerfil);

module.exports = router;