const express = require("express");
const router = express.Router();
const MembresiaController = require("../Controladores/membresia");
const authAdmin = require('../Middleware/authAdmin');
const authUnificado = require('../Middleware/authUnificado'); // ✅ Importar authUnificado

// ✅ SOLO ADMIN puede crear, actualizar y eliminar membresías
router.post("/nuevamembresia", authAdmin, MembresiaController.crearMembresia);
router.put("/actualizarmembresia/:id", authAdmin, MembresiaController.actualizarMembresia);
router.delete("/eliminarmembresia/:id", authAdmin, MembresiaController.eliminarMembresia);

// ✅ ADMIN Y TRABAJADOR pueden VER las membresías (usando authUnificado)
router.get("/vermembresia", authUnificado, MembresiaController.verMembresia);

// ✅ SOLO ADMIN puede verificar clientes de una membresía
router.get("/verificarclientes/:id", authAdmin, MembresiaController.verificarClientesMembresia);

module.exports = router;