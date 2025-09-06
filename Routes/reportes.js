const express = require('express');
const router = express.Router();
const {
    getReporteMensual,
    getReporteSemanal,
    getReporteAnual,
    getReporteComparativoClientes
} = require('../Controladores/reportes');
const authUnificado = require('../Middleware/AuthUnificado');

router.get('/mensual', authUnificado, getReporteMensual);
router.get('/semanal', authUnificado, getReporteSemanal);
router.get('/anual', authUnificado, getReporteAnual);
router.get('/comparativo', authUnificado, getReporteComparativoClientes);

module.exports = router;