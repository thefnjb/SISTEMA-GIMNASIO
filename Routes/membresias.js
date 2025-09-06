const express = require ("express");
const router = express.Router();
const MembresiaController = require("../Controladores/membresia");
const authAdmin = require('../middleware/authAdmin');

router.post("/nuevamembresia", authAdmin, MembresiaController.crearMembresia);
router.get("/vermembresia", authAdmin, MembresiaController.verMembresia);
router.put("/actualizarmembresia/:id", authAdmin, MembresiaController.actualizarMembresia);
router.delete("/eliminarmembresia/:id", authAdmin, MembresiaController.eliminarMembresia);

module.exports = router;