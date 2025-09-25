const express = require("express");
const router = express.Router();
const { generarVoucherMiembro } = require("../Controladores/voucherM");
const { generadoVoucherDIA } = require("../Controladores/voucherD");
const authUnificado = require("../Middleware/AuthUnificado");

// Ruta para generar voucher de un miembro
router.get("/miembro/:miembroId", authUnificado, generarVoucherMiembro);
router.get("/dia/:miembroId", authUnificado, generadoVoucherDIA);
module.exports = router;
