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

    // Normalizar fotocomprobante para el frontend: convertir buffers a data URL base64
    const clientesParaFront = clientes.map((c) => {
      try {
        if (c && c.fotocomprobante && c.fotocomprobante.data) {
          const fc = c.fotocomprobante;
          let dataUrl = null;
          
          // Si es Buffer (no-lean)
          if (Buffer.isBuffer(fc.data)) {
            dataUrl = `data:${fc.contentType || 'image/jpeg'};base64,${fc.data.toString('base64')}`;
          }
          // Si es objeto con estructura Buffer serializado
          else if (fc.data && typeof fc.data === 'object') {
            // Intentar diferentes formatos de Buffer serializado
            if (fc.data.type === 'Buffer' && Array.isArray(fc.data.data)) {
              const buf = Buffer.from(fc.data.data);
              dataUrl = `data:${fc.contentType || 'image/jpeg'};base64,${buf.toString('base64')}`;
            } else if (Array.isArray(fc.data)) {
              const buf = Buffer.from(fc.data);
              dataUrl = `data:${fc.contentType || 'image/jpeg'};base64,${buf.toString('base64')}`;
            }
          }
          // Si ya es string
          else if (typeof fc.data === 'string') {
            dataUrl = fc.data.startsWith('data:') ? fc.data : `data:${fc.contentType || 'image/jpeg'};base64,${fc.data}`;
          }
          
          if (dataUrl) {
            c.fotocomprobante = { data: dataUrl, contentType: fc.contentType };
            c.comprobante = dataUrl;
          }
        }
      } catch (err) {
        console.error('Error normalizando fotocomprobante:', err.message);
      }
      return c;
    });

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

  return res.status(200).json({ clientes: clientesParaFront, resumenPagos });
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

        // Procesar comprobante si viene desde el frontend (dataURL o base64)
        const comprobanteRaw = req.body.comprobante ?? req.body.fotocomprobante;
        if (comprobanteRaw) {
          try {
            // Si es data URL
            if (typeof comprobanteRaw === 'string' && comprobanteRaw.startsWith('data:')) {
              const parsed = procesarComprobanteDataUrl(comprobanteRaw);
              if (parsed) {
                nuevoCliente.fotocomprobante = { data: parsed.data, contentType: parsed.contentType };
              }
            } else if (typeof comprobanteRaw === 'string') {
              // Podría ser base64 sin prefijo
              const buffer = Buffer.from(comprobanteRaw, 'base64');
              nuevoCliente.fotocomprobante = { data: buffer, contentType: 'image/jpeg' };
            } else if (comprobanteRaw.data && Array.isArray(comprobanteRaw.data)) {
              // Caso: objeto serializado { data: [...] }
              const buf = Buffer.from(comprobanteRaw.data);
              nuevoCliente.fotocomprobante = { data: buf, contentType: comprobanteRaw.contentType || 'image/jpeg' };
            }
          } catch (err) {
            console.error('Error procesando comprobante al registrar cliente:', err);
          }
        }

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

    // Procesar comprobante si se envía en la actualización
    const comprobanteRaw = req.body.comprobante ?? req.body.fotocomprobante;
    
    // Si cambia a Efectivo, eliminar comprobante
    if (metododePago === 'Efectivo') {
      cliente.fotocomprobante = undefined;
    }
    // Si hay un nuevo comprobante (Yape/Plin), procesarlo
    else if (comprobanteRaw) {
      try {
        if (typeof comprobanteRaw === 'string' && comprobanteRaw.startsWith('data:')) {
          const parsed = procesarComprobanteDataUrl(comprobanteRaw);
          if (parsed) cliente.fotocomprobante = { data: parsed.data, contentType: parsed.contentType };
        } else if (typeof comprobanteRaw === 'string') {
          cliente.fotocomprobante = { data: Buffer.from(comprobanteRaw, 'base64'), contentType: 'image/jpeg' };
        } else if (comprobanteRaw.data && Array.isArray(comprobanteRaw.data)) {
          cliente.fotocomprobante = { data: Buffer.from(comprobanteRaw.data), contentType: comprobanteRaw.contentType || 'image/jpeg' };
        }
      } catch (err) {
        console.error('Error procesando comprobante en actualizarCliente:', err);
      }
    }
    // Si no se envía comprobante pero es Yape/Plin, mantener el existente (no hacer nada)

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