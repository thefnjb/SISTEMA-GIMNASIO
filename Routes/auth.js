const express = require('express');
const router = express.Router();
const AuthController = require('../Controladores/authController');
const GymController = require('../Controladores/gym'); // Importamos el controlador que faltaba

// Ruta para el login unificado (trabajadores y admins)
router.post('/login', AuthController.login);

// Ruta específica para el login de admin que usa tu frontend
router.post('/loginadmin', GymController.login);

// Ruta para registrar un nuevo admin
router.post('/registraradmin', GymController.registrar);

module.exports = router;
