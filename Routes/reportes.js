const express = require('express');
const router = express.Router();
const {
    getReporteMensual,
    getReporteSemanal,
    getReporteAnual,
    getReporteComparativoClientes
} = require('../Controladores/reportes');

router.get('/mensual', getReporteMensual);
router.get('/semanal', getReporteSemanal);
router.get('/anual', getReporteAnual);
router.get('/comparativo', getReporteComparativoClientes);

module.exports = router;