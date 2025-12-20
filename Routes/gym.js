const express = require("express")
const router = express.Router();
const GymController = require("../Controladores/gym");
const authAdmin = require("../Middleware/AuthAdmin");
const authUnificado = require("../Middleware/AuthUnificado");
const upload = require("../Middleware/multerConfig");

// Rutas públicas
router.post('/loginadmin', GymController.login)
router.post('/registraradmin', GymController.registrar);

// Rutas protegidas
// Obtener datos de empresa (disponible para admin y trabajadores)
router.get('/datos-empresa', authUnificado, GymController.obtenerDatosEmpresa);
// Actualizar datos de empresa (solo admin)
router.put('/datos-empresa', authAdmin, upload.single('logo'), GymController.actualizarDatosEmpresa);
// Obtener plantillas de colores (público, no requiere autenticación)
router.get('/plantillas-colores', GymController.obtenerPlantillasColores);

module.exports = router;