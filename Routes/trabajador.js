
const express = require('express');
const router = express.Router();
const authAdmin = require('../Middleware/authAdmin');
const TrabajadorController = require('../Controladores/trabajador');

// Rutas protegidas solo para Administradores
router.post("/crear-trabajador", authAdmin, TrabajadorController.crearTrabajador);
router.get("/trabajadores", authAdmin, TrabajadorController.obtenerTrabajadores);
router.put("/desactivar-trabajador/:id", authAdmin, TrabajadorController.desactivarTrabajador);
router.put("/activar-trabajador/:id", authAdmin, TrabajadorController.activarTrabajador);
router.put("/actualizar-trabajador/:id", authAdmin, TrabajadorController.actualizarTrabajador);
router.delete("/eliminar-trabajador/:id", authAdmin, TrabajadorController.eliminarTrabajador);
router.post("/registrar-entrada", authAdmin, TrabajadorController.registrarEntrada);
router.post("/registrar-salida", authAdmin, TrabajadorController.registrarSalida);
router.get("/historial-asistencia/:id", authAdmin, TrabajadorController.obtenerHistorialAsistencia);
router.delete("/eliminar-registro-asistencia/:registroId", authAdmin, TrabajadorController.eliminarRegistroAsistencia);
router.get("/reporte-asistencia-pdf/:trabajadorId", authAdmin, require('../Controladores/pdfreporteAsistenciaTrabajadores').generarReporteAsistenciaPDF);
router.get("/reporte-asistencia-excel/:trabajadorId", authAdmin, require('../Controladores/excelReporteAsistenciaTrabajadores').generarReporteAsistenciaExcel);

module.exports = router;

