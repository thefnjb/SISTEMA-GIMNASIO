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
