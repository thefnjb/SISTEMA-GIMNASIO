const express = require ("express");
const router = express.Router();
const MembresiaController = require("../Controladores/membresia");
const auth = require("../Auth/Auth");

router.post("/nuevamembresia", auth, MembresiaController.crearMembresia);
router.get("/vermembresia", auth, MembresiaController.verMembresia);
router.delete("/eliminarmembresia/:id", auth, MembresiaController.eliminarMembresia);

module.exports = router;