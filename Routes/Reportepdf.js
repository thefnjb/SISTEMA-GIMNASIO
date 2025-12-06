const express = require("express");
const router = express.Router();
const { generarReporteClientesPorDia } = require("../Controladores/pdfreportedia");
const { generarReporteMensual } = require("../Controladores/pdfreporteMensual");
const { generarReporteClientesConstantesPDF } = require("../Controladores/pdfreporteClientesConstantes");
const { generarReporteClientesConstantesExcel } = require("../Controladores/excelReporteClientesConstantes");
const authUnificado = require("../Middleware/authUnificado");
const soloAdmin = require("../Middleware/soloAdmin");


router.get("/reporte-dia", authUnificado, generarReporteClientesPorDia);
router.get("/reporte-mensual", authUnificado, soloAdmin, generarReporteMensual);
router.get("/reporte-clientes-constantes-pdf", authUnificado, soloAdmin, generarReporteClientesConstantesPDF);
router.get("/reporte-clientes-constantes-excel", authUnificado, soloAdmin, generarReporteClientesConstantesExcel);

module.exports = router;
