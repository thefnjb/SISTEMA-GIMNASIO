const mongoose = require('mongoose');
const ClientesPorDia = require("../Modelos/ClientesporDia");

// --- Función de ayuda para calcular rango semanal ---
function getWeekRange(date = new Date()) {
    const today = new Date(date);
  const day = today.getDay(); // 0 = domingo, 1 = lunes, ...
  const diffToMonday = today.getDate() - day + (day === 0 ? -6 : 1); // mover al lunes
    const monday = new Date(today.setDate(diffToMonday));
    monday.setHours(0, 0, 0, 0);

    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 7);

    return { monday, sunday };
}

// Obtener todos los clientes del día para el gimnasio del usuario logueado
exports.getAllClientes = async (req, res) => {
    try {
        const { id: userId, rol, gym_id } = req.usuario;

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);   

        // --- CORRECCIÓN: Usar 'new' para todos los ObjectId ---
        const gymObjectId = new mongoose.Types.ObjectId(gym_id);

        let filtro = {
            gym: gymObjectId,
            fecha: { $gte: today, $lt: tomorrow }
        };

        if (rol === 'trabajador') {
            filtro.creadorId = userId;
        }

        const clientes = await ClientesPorDia.find(filtro).sort({ createdAt: -1 });

        const conteoPagos = await ClientesPorDia.aggregate([
            { $match: { gym: gymObjectId, fecha: { $gte: today, $lt: tomorrow } } },
            { $group: { _id: "$metododePago", count: { $sum: 1 } } }
        ]);

        const resumenPagos = { Yape: 0, Plin: 0, Efectivo: 0, Total: 0 };
        conteoPagos.forEach(item => {
            if (resumenPagos.hasOwnProperty(item._id)) {
                resumenPagos[item._id] = item.count;
                resumenPagos.Total += item.count;
            }
        });

        res.status(200).json({ clientes, resumenPagos });

    } catch (err) {
        console.error("Error en getAllClientes:", err);
        res.status(500).json({ error: "Error al obtener los clientes del día" });
    }
};

// Registrar un nuevo cliente del día
exports.registrarCliente = async (req, res) => {
    try {
        const { nombre, fecha, metododePago } = req.body;
        const { id, rol, gym_id } = req.usuario;

        if (!nombre || !nombre.trim()) {
            return res.status(400).json({ error: "El nombre es requerido" });
        }

        const now = new Date();
        const horaInicio = now.toTimeString().slice(0, 5);

        const nuevoCliente = new ClientesPorDia({
            nombre: nombre.trim(),
            fecha: fecha || new Date(),
            horaInicio,
            metododePago: metododePago || 'Efectivo',
            gym: gym_id,
            creadoPor: rol,
            creadorId: id
        });

        await nuevoCliente.save();
        res.status(201).json({ message: "Cliente registrado", cliente: nuevoCliente });

    } catch (err) {
        console.error("Error en registrarCliente:", err);
        res.status(500).json({ error: "Error al registrar el cliente" });
    }
};

// Actualizar un cliente existente
exports.actualizarCliente = async (req, res) => {
    try {
        const { id: clienteId } = req.params;
        const { nombre, metododePago } = req.body;
        const { id: userId, rol, gym_id } = req.usuario;

        if (!nombre || !nombre.trim()) {
            return res.status(400).json({ error: "El nombre es requerido" });
        }

        const cliente = await ClientesPorDia.findOne({ _id: clienteId, gym: gym_id });

        if (!cliente) {
            return res.status(404).json({ error: "Cliente no encontrado." });
        }

        if (rol !== 'admin' && cliente.creadorId.toString() !== userId) {
            return res.status(403).json({ error: "No tiene permisos para modificar este cliente." });
        }

        const clienteActualizado = await ClientesPorDia.findByIdAndUpdate(
            clienteId,
            { nombre: nombre.trim(), metododePago: metododePago || 'Efectivo' },
            { new: true }
        );

        res.status(200).json({ message: "Cliente actualizado", cliente: clienteActualizado });

    } catch (err) {
        console.error("Error en actualizarCliente:", err);
        res.status(500).json({ error: "Error al actualizar el cliente" });
    }
};

// Eliminar un cliente
exports.eliminarCliente = async (req, res) => {
    try {
        const { id: clienteId } = req.params;
        const { id: userId, rol, gym_id } = req.usuario;

        const cliente = await ClientesPorDia.findOne({ _id: clienteId, gym: gym_id });

        if (!cliente) {
            return res.status(404).json({ error: "Cliente no encontrado." });
        }

        if (rol !== 'admin' && cliente.creadorId.toString() !== userId) {
            return res.status(403).json({ error: "No tiene permisos para eliminar este cliente." });
        }

        await ClientesPorDia.findByIdAndDelete(clienteId);
        res.status(200).json({ message: "Cliente eliminado" });

    } catch (err) {
        console.error("Error en eliminarCliente:", err);
        res.status(500).json({ error: "Error al eliminar el cliente" });
    }
};

// Historial de clientes
exports.obtenerHistorialMisClientes = async (req, res) => {
    try {
        const { id: creadorId } = req.usuario;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;

        const clientes = await ClientesPorDia.find({ creadorId })
            .sort({ fecha: -1, createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await ClientesPorDia.countDocuments({ creadorId });

        res.json({
            clientes,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(total / limit),
                totalClientes: total
            }
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error al obtener historial" });
    }
};