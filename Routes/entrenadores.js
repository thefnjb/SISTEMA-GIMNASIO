const express = require("express");
const router = express.Router();
const EntrenadorController = require("../Controladores/entrenador");
const auth = require("../Auth/Auth");
const upload = require("../Middleware/multerConfig");

router.post("/nuevo", auth, upload.single("fotoPerfil"), EntrenadorController.crearEntrenador);
router.get("/ver", auth, EntrenadorController.verEntrenadores);
router.put("/actualizar/:id", auth, EntrenadorController.actualizarEntrenador);
router.delete("/eliminar/:id", auth, EntrenadorController.eliminarEntrenador);

module.exports = router;
