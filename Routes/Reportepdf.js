const express = require("express");
const router = express.Router();
const { generarReporteClientesPorDia } = require("../Controladores/pdfreportedia");
const { generarReporteMensual } = require("../Controladores/pdfreporteMensual");
const authUnificado = require("../Middleware/AuthUnificado");
const soloAdmin = require("../Middleware/soloAdmin");


router.get("/reporte-dia", authUnificado, generarReporteClientesPorDia);
router.get("/reporte-mensual", authUnificado, soloAdmin, generarReporteMensual);

module.exports = router;
