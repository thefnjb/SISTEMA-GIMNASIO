
const express = require('express');
const router = express.Router();
const authUnificado = require('../Middleware/AuthUnificado');
const soloAdmin = require('../Middleware/soloAdmin');
const TrabajadorController = require('../Controladores/trabajador');

// Ejemplo de rutas protegidas solo para Administradores
router.post("/crear-trabajador", [authUnificado, soloAdmin], TrabajadorController.crearTrabajador);
router.get("/trabajadores", [authUnificado, soloAdmin], TrabajadorController.obtenerTrabajadores);
router.put("/desactivar-trabajador/:id", [authUnificado, soloAdmin], TrabajadorController.desactivarTrabajador);

module.exports = router;

