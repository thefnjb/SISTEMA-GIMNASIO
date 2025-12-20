const express = require('express');
const router = express.Router();
const AuthController = require('../Controladores/authController');
const GymController = require('../Controladores/gym'); // Importamos el controlador que faltaba

// RUTA DE LOGIN UNIFICADO PARA ADMIN Y TRABAJADOR
router.post('/login', AuthController.loginUnificado);

// RUTA DE RECUPERACIÓN DE CONTRASEÑA (solo requiere email y nueva contraseña)
router.post('/recuperar-cambiar', AuthController.recuperarCambiar);

// Ruta para registrar un nuevo admin
router.post('/registraradmin', GymController.registrar);

module.exports = router;
