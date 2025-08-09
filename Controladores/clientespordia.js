const ClientesPorDia = require("../Modelos/ClientesporDia");


// Obtener todos los clientes del día y el conteo de métodos de pago
exports.getAllClientes = async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Establecer al inicio del día actual

        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1); 

        const clientes = await ClientesPorDia.find({
            gym: req.gym._id,
            fecha: {
                $gte: today,
                $lt: tomorrow
            }
        }).sort({ createdAt: -1 });

        const conteoPagos = await ClientesPorDia.aggregate([
            {
                $match: {
                    gym: req.gym._id,
                    fecha: {
                        $gte: today,
                        $lt: tomorrow
                    }
                }
            },
            {
                $group: {
                    _id: "$metododePago",
                    count: { $sum: 1 }
                }
            }
        ]);

        const resumenPagos = {
            Yape: 0,
            Plin: 0,
            Efectivo: 0,
            Total: 0
        };

        conteoPagos.forEach(item => {
            if (resumenPagos.hasOwnProperty(item._id)) {
                resumenPagos[item._id] = item.count;
                resumenPagos.Total += item.count;
            }
        });

        res.status(200).json({ clientes, resumenPagos });
    } catch (err) {
        console.error("Error en getAllClientes:", err);
        res.status(500).json({ error: "Error al obtener los clientes por día y el resumen de pagos" });
    }
};
// Actualizar clientes por dia
exports.actualizarCliente = async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, metododePago } = req.body;

        const clienteActualizado = await ClientesPorDia.findByIdAndUpdate(
            id,
            { nombre, metododePago },
            { new: true }
        );

        if (!clienteActualizado) {
            return res.status(404).json({ error: "Cliente no encontrado" });
        }

        res.status(200).json({
            message: "Cliente actualizado correctamente",
            cliente: clienteActualizado,
        });
    } catch (err) {
        console.error("Error en actualizarCliente:", err);
        res.status(500).json({ error: "Error al actualizar el cliente" });
    }
};

// Eliminar cliente por día
exports.eliminarCliente = async (req, res) => {
    try {
        const { id } = req.params;
        const clienteEliminado = await ClientesPorDia.findByIdAndDelete(id);

        if (!clienteEliminado) {
            return res.status(404).json({ error: "Cliente no encontrado" });
        }

        res.status(200).json({ message: "Cliente eliminado correctamente" });
    } catch (err) {
        console.error("Error en eliminarCliente:", err);
        res.status(500).json({ error: "Error al eliminar el cliente" });
    }
};

// Registrar cliente por día
exports.registrarCliente = async (req, res) => {
  try {
    const { nombre, fecha, metododePago } = req.body;

    // Capturar hora actual en formato HH:mm
    const now = new Date();
    const horaInicio = now.toTimeString().slice(0, 5); 

    const nuevoCliente = new ClientesPorDia({
      nombre,
      fecha,
      horaInicio, 
      metododePago,
      gym: req.gym._id, 
    });

    await nuevoCliente.save();

    res.status(201).json({
      message: "Cliente registrado correctamente",
      cliente: nuevoCliente,
    });
  } catch (err) {
    console.error("Error en registrarCliente:", err);
    res.status(500).json({ error: "Error al registrar el cliente por día" });
  }
};
