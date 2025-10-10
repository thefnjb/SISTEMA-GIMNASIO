const express = require("express");
const router = express.Router();
const { generarExcelMiembros } = require("../Controladores/excelMiembros");
const authAdmin = require("../Middleware/authAdmin");

// Ruta para exportar miembros a Excel
router.get("/excel/miembros", authAdmin, generarExcelMiembros);

module.exports = router;
