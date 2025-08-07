// Rutas/miembros.js
const express = require("express");
const router = express.Router();
const MiembrosController = require("../Controladores/miembros");
const auth = require("../Auth/Auth");

router.get("/miembros", auth, MiembrosController.getAllMiembros);
router.post("/registrarmiembros", auth, MiembrosController.registroMiembros);
router.patch("/actualizarmiembro/:id", auth, MiembrosController.actualizarMiembro);
router.delete("/eliminarmiembro/:id", auth, MiembrosController.eliminarMiembro);


module.exports = router;
