
const express = require('express');
const router = express.Router();
const authAdmin = require('../middleware/authAdmin'); // Tu middleware renombrado
const TrabajadorController = require('../Controladores/trabajador');

router.post("/crear-trabajador", authAdmin, TrabajadorController.crearTrabajador);
router.get("/trabajadores", authAdmin, TrabajadorController.obtenerTrabajadores);
router.put("/desactivar-trabajador/:id", authAdmin, TrabajadorController.desactivarTrabajador);

module.exports = router;
