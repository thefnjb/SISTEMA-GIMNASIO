const express = require('express');
const router = express.Router();
const { consultarDni } = require('../Controladores/reniecController');
const authUnificado = require('../Middleware/authUnificado');


// Ruta para consultar DNI, protegida para que solo usuarios autenticados puedan usarla
router.get('/dni/:numero', authUnificado, consultarDni);

module.exports = router;
