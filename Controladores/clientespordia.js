const ClientesPorDia = require("../Modelos/ClientesporDia");


// Obtener todos los clientes del día
exports.getAllClientes = async (req, res) => {
    try {
    const clientes = await ClientesPorDia.find({ gym: req.gym._id })
        .sort({ createdAt: -1 });
    res.status(200).json(clientes);
    } catch (err) {
        console.error("Error en getAllClientes:", err);
        res.status(500).json({ error: "Error al obtener los clientes por día" });
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

    const nuevoCliente = new ClientesPorDia({
        nombre,
        fecha,
        metododePago,
      gym: req.gym._id, // auth inyecta el gym
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
