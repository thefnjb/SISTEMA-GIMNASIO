
const express = require('express');
const router = express.Router();
const authAdmin = require('../Middleware/AuthAdmin');
const TrabajadorController = require('../Controladores/trabajador');

// Rutas protegidas solo para Administradores
router.post("/crear-trabajador", authAdmin, TrabajadorController.crearTrabajador);
router.get("/trabajadores", authAdmin, TrabajadorController.obtenerTrabajadores);
router.put("/desactivar-trabajador/:id", authAdmin, TrabajadorController.desactivarTrabajador);
router.put("/activar-trabajador/:id", authAdmin, TrabajadorController.activarTrabajador);
router.put("/actualizar-trabajador/:id", authAdmin, TrabajadorController.actualizarTrabajador);
router.delete("/eliminar-trabajador/:id", authAdmin, TrabajadorController.eliminarTrabajador);

module.exports = router;

