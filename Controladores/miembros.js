const Miembro = require("../Modelos/Miembro");
const Membresia = require("../Modelos/Membresia");
const Entrenador = require("../Modelos/Entrenador");

// --- Funciones de Ayuda ---
const calcularEstado = (fechaVencimiento) => {
  if (!fechaVencimiento) return "inactivo";
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  return new Date(fechaVencimiento) < hoy ? "inactivo" : "activo";
};

const calcularVencimiento = (fechaBase, meses) => {
  const f = new Date(fechaBase);
  f.setMonth(f.getMonth() + Number(meses));
  return f;
};

// --- Controladores Refactorizados ---

// Obtener todos los miembros del gimnasio (con filtros y paginación)
exports.getAllMiembros = async (req, res) => {
  try {
    const { id: userId, rol, gym_id } = req.usuario;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || "";
    const skip = (page - 1) * limit;

    // El filtro base siempre es por gimnasio
    let filter = { gym: gym_id };

    // Si es trabajador, se añade filtro por creador
    if (rol === "trabajador") {
      filter.creadorId = userId;
    }

    // Añadir filtro de búsqueda de texto
    if (search) {
      filter.$or = [
        { nombreCompleto: { $regex: search, $options: "i" } },
        { telefono: { $regex: search, $options: "i" } },
      ];
    }

    const miembros = await Miembro.find(filter)
      .populate("mensualidad")
      .populate("entrenador", "nombre telefono") // <- agregado
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Miembro.countDocuments(filter);

    res.json({
      miembros,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Registrar un nuevo miembro
exports.registroMiembros = async (req, res) => {
  try {
    const {
      nombreCompleto,
      telefono,
      mensualidad,
      entrenador,
      metodoPago,
      estadoPago,
      debe,
      fechaIngreso,
    } = req.body;
    const { id: creadorId, rol: creadoPor, gym_id } = req.usuario;

    if (!nombreCompleto || !telefono || !mensualidad) {
      return res
        .status(400)
        .json({ error: "Nombre, teléfono y mensualidad son requeridos" });
    }

    const membresiaSeleccionada = await Membresia.findById(mensualidad);
    if (!membresiaSeleccionada) {
      return res.status(404).json({ error: "Membresía no encontrada" });
    }

    // Validar que no exista miembro con el mismo teléfono en el gym
    const miembroExiste = await Miembro.findOne({ telefono, gym: gym_id });
    if (miembroExiste) {
      return res.status(409).json({
        error: "Ya existe un miembro con este teléfono en este gimnasio",
      });
    }

    // Validar entrenador (si se envía)
    let entrenadorValido = null;
    if (entrenador) {
      entrenadorValido = await Entrenador.findOne({
        _id: entrenador,
        gym: gym_id,
      });
      if (!entrenadorValido) {
        return res.status(404).json({ error: "Entrenador no encontrado" });
      }
    }

    const fechaInicio = fechaIngreso
      ? new Date(fechaIngreso + "T00:00:00")
      : new Date();
    const vencimiento = calcularVencimiento(
      fechaInicio,
      membresiaSeleccionada.duracion
    );

    const nuevoMiembro = new Miembro({
      nombreCompleto: nombreCompleto.trim(),
      telefono: telefono.trim(),
      mensualidad,
      entrenador: entrenadorValido ? entrenadorValido._id : undefined,
      metodoPago: metodoPago || "efectivo",
      estadoPago: estadoPago || "Pendiente",
      debe: debe || 0,
      fechaIngreso: fechaInicio,
      vencimiento,
      estado: "activo",
      gym: gym_id,
      creadoPor,
      creadorId,
    });

    await nuevoMiembro.save();
    res.status(201).json({
      miembro: nuevoMiembro,
      mensaje: "Miembro registrado exitosamente",
    });
  } catch (error) {
    if (error.code === 11000) {
      res.status(400).json({ error: "El teléfono ya está registrado" });
    } else {
      res.status(500).json({ error: error.message });
    }
  }
};

// Ver un miembro específico
exports.verMiembro = async (req, res) => {
  try {
    const { gym_id } = req.usuario;
    const miembro = await Miembro.findOne({
      _id: req.params.id,
      gym: gym_id,
    }).populate("mensualidad entrenador gym");

    if (!miembro) {
      return res.status(404).json({ error: "Miembro no encontrado" });
    }
    res.json({ miembro });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Actualizar un miembro
exports.actualizarMiembro = async (req, res) => {
  try {
    const { id: miembroId } = req.params;
    const { gym_id } = req.usuario;

    const miembro = await Miembro.findOne({ _id: miembroId, gym: gym_id });
    if (!miembro) {
      return res.status(404).json({ error: "Miembro no encontrado" });
    }

    const miembroActualizado = await Miembro.findByIdAndUpdate(
      miembroId,
      req.body,
      { new: true }
    );
    res.json({ miembro: miembroActualizado, mensaje: "Miembro actualizado" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Renovar membresía de un miembro
exports.renovarMiembro = async (req, res) => {
  try {
    const { id: miembroId } = req.params;
    const { gym_id } = req.usuario;
    const { meses, debe } = req.body;

    const miembro = await Miembro.findOne({ _id: miembroId, gym: gym_id });
    if (!miembro) {
      return res.status(404).json({ error: "Miembro no encontrado" });
    }

    const mesesNum = Number(meses || 1);
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    const base =
      miembro.vencimiento && new Date(miembro.vencimiento) > hoy
        ? new Date(miembro.vencimiento)
        : hoy;
    const nuevoVenc = calcularVencimiento(base, mesesNum);

    miembro.vencimiento = nuevoVenc;
    miembro.estado = calcularEstado(nuevoVenc);
    miembro.ultimaRenovacion = new Date();
    if (debe !== undefined) miembro.debe = Number(debe);

    await miembro.save();
    res.json({ message: "Renovación exitosa", miembro });
  } catch (err) {
    res.status(500).json({ error: "Error al renovar" });
  }
};

// Eliminar un miembro
exports.eliminarMiembro = async (req, res) => {
  try {
    const { id: miembroId } = req.params;
    const { gym_id } = req.usuario;

    const result = await Miembro.deleteOne({ _id: miembroId, gym: gym_id });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: "Miembro no encontrado" });
    }

    res.json({ mensaje: "Miembro eliminado" });
  } catch (err) {
    res.status(500).json({ error: "Error al eliminar" });
  }
};
