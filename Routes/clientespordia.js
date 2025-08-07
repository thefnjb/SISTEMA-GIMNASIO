const express = require("express");
const router = express.Router();
const ClientesController = require("../Controladores/clientespordia");
const auth = require("../Auth/Auth");

router.get("/clientesdia", auth, ClientesController.getAllClientes);
router.post("/registrarcliente", auth, ClientesController.registrarCliente);
router.put("/actualizarcliente/:id", auth, ClientesController.actualizarCliente);
router.delete("/eliminarcliente/:id", auth, ClientesController.eliminarCliente);


module.exports = router;
