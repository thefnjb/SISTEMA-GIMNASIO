const express = require("express");
const router = express.Router();
const EntrenadorController = require("../Controladores/entrenador");
const authAdmin = require('../middleware/authAdmin');
const upload = require("../middleware/multerConfig");

router.post("/nuevo", authAdmin, upload.single("fotoPerfil"), EntrenadorController.crearEntrenador);
router.get("/ver", authAdmin, EntrenadorController.verEntrenadores);
router.get("/ver/:id/photo", EntrenadorController.verFotoPerfil);
router.put("/actualizar/:id", authAdmin, EntrenadorController.actualizarEntrenador);
router.delete("/eliminar/:id", authAdmin, EntrenadorController.eliminarEntrenador);

module.exports = router;
