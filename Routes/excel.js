const express = require("express");
const router = express.Router();
const { generarExcelMiembros } = require("../Controladores/excelMiembros");

// Ruta para exportar miembros a Excel
router.get("/excel/miembros", generarExcelMiembros);

module.exports = router;
