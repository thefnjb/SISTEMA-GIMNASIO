// Controladores/clientespordia.js
const mongoose = require("mongoose");
const ClientesPorDia = require("../Modelos/ClientesporDia");
const Trabajador = require("../Modelos/Trabajador");

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

// --- Función de ayuda para procesar data URL de comprobante ---
const procesarComprobanteDataUrl = (dataUrl) => {
  if (!dataUrl || typeof dataUrl !== 'string') return null;
  const matches = dataUrl.match(/^data:(image\/(png|jpeg|jpg|webp));base64,(.+)$/);
  if (!matches) return null;
  const mime = matches[1];
  const base64Data = matches[3];
  return { data: Buffer.from(base64Data, 'base64'), contentType: mime };
}

// ---------- GET: clientes del día ----------
exports.getAllClientes = async (req, res) => {
  try {
    // seguridad: verificar usuario
    if (!req.usuario || !req.usuario.id) {
      return res.status(401).json({ error: "Usuario no autenticado" });
    }
    const { id: userId, rol } = req.usuario;

    // opcional: verificar conexión a Mongo
    if (!mongoose.connection.readyState) {
      return res.status(500).json({ error: "No conectado a la base de datos" });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    let filtro = { fecha: { $gte: today, $lt: tomorrow } };
    if (rol === "trabajador") filtro.creadorId = userId;

    const clientesDocs = await ClientesPorDia.find(filtro).sort({ createdAt: -1 }).lean();

    // agregar nombre del creador (si existe)
    const clientes = await Promise.all(
      clientesDocs.map(async (cliente) => {
        if (cliente.creadoPor === "admin") {
          cliente.creadorNombre = "Administrador";
        } else if (cliente.creadoPor === "trabajador" && cliente.creadorId) {
          const trabajador = await Trabajador.findById(cliente.creadorId).select("nombre").lean();
          cliente.creadorNombre = trabajador ? trabajador.nombre : "Trabajador desconocido";
        } else {
          cliente.creadorNombre = "Desconocido";
        }
        return cliente;
      })
    );

    // conteo de pagos (solo para el rango de hoy)
    const conteoPagos = await ClientesPorDia.aggregate([
      { $match: { fecha: { $gte: today, $lt: tomorrow } } },
      { $group: { _id: "$metododePago", count: { $sum: 1 } } },
    ]);

    const resumenPagos = { Yape: 0, Plin: 0, Efectivo: 0, Total: 0 };
    conteoPagos.forEach((item) => {
      if (resumenPagos.hasOwnProperty(item._id)) {
        resumenPagos[item._id] = item.count;
        resumenPagos.Total += item.count;
      }
    });

    return res.status(200).json({ clientes, resumenPagos });
  } catch (err) {
    console.error("❌ Error en getAllClientes:", err);
    return res.status(500).json({ error: "Error al obtener los clientes del día", detalles: err.message });
  }
};

// ---------- POST: registrar cliente ----------
exports.registrarCliente = async (req, res) => {
    try {
        const { nombre, fecha, metododePago } = req.body;
        const { id, rol } = req.usuario;

    if (!nombre || !nombre.trim()) return res.status(400).json({ error: "El nombre es requerido" });

        const now = new Date();
        const horaInicio = now.toTimeString().slice(0, 5);

        const nuevoCliente = new ClientesPorDia({
            nombre: nombre.trim(),
            fecha: fecha || new Date(),
            horaInicio,
            metododePago: metododePago || 'Efectivo',
            creadoPor: rol,
            creadorId: id
        });

    await nuevoCliente.save();
    return res.status(201).json({ message: "Cliente registrado", cliente: nuevoCliente });
  } catch (err) {
    console.error("❌ Error en registrarCliente:", err);
    return res.status(500).json({ error: "Error al registrar el cliente", detalles: err.message });
  }
};

// ---------- PUT: actualizar cliente ----------
exports.actualizarCliente = async (req, res) => {
  try {
    if (!req.usuario || !req.usuario.id) return res.status(401).json({ error: "Usuario no autenticado" });
    const { id: userId, rol } = req.usuario;
    const { id: clienteId } = req.params;
    const { nombre, metododePago, monto } = req.body;

    if (!nombre || !nombre.trim()) return res.status(400).json({ error: "El nombre es requerido" });

    const cliente = await ClientesPorDia.findById(clienteId);
    if (!cliente) return res.status(404).json({ error: "Cliente no encontrado." });

    if (rol !== "admin" && cliente.creadorId?.toString() !== userId) {
      return res.status(403).json({ error: "No tiene permisos para modificar este cliente." });
    }

    cliente.nombre = nombre.trim();
    cliente.metododePago = metododePago || cliente.metododePago || "Efectivo";
    if (monto != null) cliente.monto = Number(monto);

    const clienteActualizado = await cliente.save();
    return res.status(200).json({ message: "Cliente actualizado", cliente: clienteActualizado });
  } catch (err) {
    console.error("❌ Error en actualizarCliente:", err);
    return res.status(500).json({ error: "Error al actualizar el cliente", detalles: err.message });
  }
};

// ---------- DELETE: eliminar cliente ----------
exports.eliminarCliente = async (req, res) => {
  try {
    if (!req.usuario || !req.usuario.id) return res.status(401).json({ error: "Usuario no autenticado" });
    const { id: userId, rol } = req.usuario;
    const { id: clienteId } = req.params;

    const cliente = await ClientesPorDia.findById(clienteId);
    if (!cliente) return res.status(404).json({ error: "Cliente no encontrado." });

    if (rol !== "admin" && cliente.creadorId?.toString() !== userId) {
      return res.status(403).json({ error: "No tiene permisos para eliminar este cliente." });
    }

    await ClientesPorDia.findByIdAndDelete(clienteId);
    return res.status(200).json({ message: "Cliente eliminado" });
  } catch (err) {
    console.error("❌ Error en eliminarCliente:", err);
    return res.status(500).json({ error: "Error al eliminar el cliente", detalles: err.message });
  }
};

// ---------- Historial (mis clientes) ----------
exports.obtenerHistorialMisClientes = async (req, res) => {
  try {
    if (!req.usuario || !req.usuario.id) return res.status(401).json({ error: "Usuario no autenticado" });
    const { id: creadorId } = req.usuario;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const clientes = await ClientesPorDia.find({ creadorId })
      .sort({ fecha: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await ClientesPorDia.countDocuments({ creadorId });

    return res.json({
      clientes,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalClientes: total,
      },
    });
  } catch (error) {
    console.error("❌ Error en obtenerHistorialMisClientes:", error);
    return res.status(500).json({ error: "Error al obtener historial", detalles: error.message });
  }
};