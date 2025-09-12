const express = require("express");
const router = express.Router();
const { generarReporteClientesPorDia } = require("../Controladores/pdfreportedia");
const authUnificado = require("../Middleware/AuthUnificado");


router.get("/reporte-dia", authUnificado, generarReporteClientesPorDia);

module.exports = router;
