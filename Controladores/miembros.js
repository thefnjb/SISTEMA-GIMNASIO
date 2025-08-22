// Controladores/miembros.js
const Miembro = require("../Modelos/Miembro");
const Membresia = require("../Modelos/Membresia");

// Función para calcular nuevo estado según vencimiento
const calcularEstado = (fechaVencimiento) => {
  if (!fechaVencimiento) return "inactivo";
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0); // Ignorar la hora para la comparación
  return new Date(fechaVencimiento) < hoy ? "inactivo" : "activo";
};

// Función para calcular vencimiento sumando meses a una fecha base de forma precisa
const calcularVencimiento = (fechaBase, meses) => {
  const f = new Date(fechaBase);
  const diaOriginal = f.getDate();
  f.setMonth(f.getMonth() + Number(meses));
  if (f.getDate() !== diaOriginal) {
    f.setDate(0);
  }
  return f;
};

// ✅ Obtener todos los miembros con paginación y filtro opcional
exports.getAllMiembros = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 0;
    const limit = parseInt(req.query.limit) || 0;
    const search = req.query.search || "";

    const filter = search
      ? {
          $or: [
            { nombreCompleto: { $regex: search, $options: "i" } },
            { telefono: { $regex: search, $options: "i" } },
          ],
        }
      : {};

    let query = Miembro.find(filter)
      .populate("mensualidad")
      .populate("membresia")
      .populate("entrenador")
      .populate("gym")
      .sort({ fechaIngreso: -1 }); // Ordenar por más recientes

    if (page > 0 && limit > 0) {
      query = query.skip((page - 1) * limit).limit(limit);
    }

    const miembros = await query.exec();

    if (page > 0 && limit > 0) {
      const total = await Miembro.countDocuments(filter);
      return res.json({
        miembros,
        total,
        page,
        totalPages: Math.ceil(total / limit),
      });
    }

    res.json(miembros);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Registrar nuevo miembro
exports.registroMiembros = async (req, res) => {
  try {
    const {
      nombreCompleto,
      telefono,
      mensualidad, // ID de la membresía
      entrenador,
      metodoPago,
      estadoPago,
      debe,
      fechaIngreso, // Recibir la fecha de ingreso del frontend
    } = req.body;

    const membresiaSeleccionada = await Membresia.findById(mensualidad);
    if (!membresiaSeleccionada) {
      return res.status(404).json({ error: "Membresía no encontrada" });
    }

    // Usar la fecha de ingreso del frontend (asegurando que sea UTC), o la actual si no se provee
    const fechaInicio = fechaIngreso ? new Date(fechaIngreso + 'T00:00:00') : new Date();
    const vencimiento = calcularVencimiento(fechaInicio, membresiaSeleccionada.duracion);

    const nuevoMiembro = new Miembro({
      nombreCompleto,
      telefono,
      mensualidad,
      entrenador,
      metodoPago,
      estadoPago,
      debe: debe || 0,
      fechaIngreso: fechaInicio,
      vencimiento,
      estado: "activo",
    });

    await nuevoMiembro.save();
    res.status(201).json(nuevoMiembro);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


// Ver un miembro específico
exports.verMiembro = async (req, res) => {
  try {
    const miembro = await Miembro.findById(req.params.id)
      .populate("mensualidad")
      .populate("membresia")
      .populate("entrenador")
      .populate("gym");

    if (!miembro) {
      return res.status(404).json({ error: "Miembro no encontrado" });
    }

    res.json(miembro);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Actualizar miembro
exports.actualizarMiembro = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      nombreCompleto,
      telefono,
      mensualidad,
      entrenador,
      metodoPago,
      estadoPago,
      debe,
    } = req.body;

    const miembroActualizado = await Miembro.findByIdAndUpdate(
      id,
      {
        nombreCompleto,
        telefono,
        mensualidad,
        entrenador,
        metodoPago,
        estadoPago,
        ...(debe !== undefined && { debe }),
      },
      { new: true }
    );

    if (!miembroActualizado) {
      return res.status(404).json({ error: "Miembro no encontrado" });
    }

    res.json(miembroActualizado);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Renovar membresía de un miembro
exports.renovarMiembro = async (req, res) => {
  try {
    const { id } = req.params;
    const { meses, debe } = req.body;

    const miembro = await Miembro.findById(id);
    if (!miembro)
      return res.status(404).json({ error: "Miembro no encontrado" });

    const mesesNum = Number(meses || 0);
    if (!mesesNum || mesesNum < 1)
      return res.status(400).json({ error: "Meses inválidos" });

    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    const base =
      miembro.vencimiento && new Date(miembro.vencimiento) > hoy
        ? new Date(miembro.vencimiento)
        : hoy;

    const nuevoVenc = calcularVencimiento(base, mesesNum);

    miembro.vencimiento = nuevoVenc;
    miembro.estado = calcularEstado(nuevoVenc);
    miembro.ultimaRenovacion = new Date(); // Guardar la fecha de esta renovación

    if (debe !== undefined) {
      miembro.debe = Number(debe);
    }

    await miembro.save();

    res.json({ message: "Renovación realizada correctamente", miembro });
  } catch (err) {
    console.error("Error en renovarMiembro:", err);
    res.status(500).json({ error: "Error al renovar" });
  }
};

// Eliminar miembro
exports.eliminarMiembro = async (req, res) => {
  try {
    const { id } = req.params;
    const miembroEliminado = await Miembro.findByIdAndDelete(id);

    if (!miembroEliminado) {
      return res.status(404).json({ error: "Miembro no encontrado" });
    }

    res.json({ mensaje: "Miembro eliminado correctamente" });
  } catch (err) {
    console.error("Error en eliminarMiembro:", err);
    res.status(500).json({ error: "Error al eliminar el miembro" });
  }
};