const express = require("express");
const router = express.Router();
const ClientesController = require("../Controladores/clientespordia");
const authUnificado = require("../Middleware/authUnificado");

router.get("/clientesdia", authUnificado, ClientesController.getAllClientes);
router.get("/todosclientes", authUnificado, ClientesController.getAllClientesHistorial);
router.post("/registrarcliente", authUnificado, ClientesController.registrarCliente);
router.put("/actualizarcliente/:id", authUnificado, ClientesController.actualizarCliente);
router.delete("/eliminarcliente/:id", authUnificado, ClientesController.eliminarCliente);
router.get("/historial-mis-clientes", authUnificado, ClientesController.obtenerHistorialMisClientes);



module.exports = router;
