const express = require("express");
const router = express.Router();
const { generarExcelMiembros } = require("../Controladores/excelMiembros");
const AuthAdmin = require("../Middleware/AuthAdmin");

// Ruta para exportar miembros a Excel
router.get("/excel/miembros", AuthAdmin, generarExcelMiembros);

module.exports = router;
