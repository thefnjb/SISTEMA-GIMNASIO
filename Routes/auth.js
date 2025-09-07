const express = require('express');
const router = express.Router();
const AuthController = require('../Controladores/authController');
const GymController = require('../Controladores/gym'); // Importamos el controlador que faltaba

// RUTA DE LOGIN UNIFICADO PARA ADMIN Y TRABAJADOR
router.post('/login', AuthController.loginUnificado);

// Ruta para registrar un nuevo admin (se mantiene si es necesaria)
router.post('/registraradmin', GymController.registrar);

module.exports = router;
