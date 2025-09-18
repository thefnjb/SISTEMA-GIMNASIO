const Miembro = require("../Modelos/Miembro");
const Membresia = require("../Modelos/Membresia");
const Entrenador = require("../Modelos/Entrenador");
const Gym = require("../Modelos/Gimnasio");
const Trabajador = require("../Modelos/Trabajador");

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
// --- Controlador ---
exports.getAllMiembros = async (req, res) => {
  try {
    const { id: userId, rol } = req.usuario;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || "";
    const skip = (page - 1) * limit;

    let filter = {};

    if (search) {
      filter.$or = [
        { nombreCompleto: { $regex: search, $options: "i" } },
        { telefono: { $regex: search, $options: "i" } },
      ];
    }

    const miembrosDocs = await Miembro.find(filter)
      .populate("mensualidad")
      .populate("entrenador", "nombre telefono")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const miembros = await Promise.all(
      miembrosDocs.map(async (miembro) => {
        if (miembro.creadorId) {
          if (miembro.creadoPor === "admin") {
            miembro.creadorNombre = "Administrador";
          } else if (miembro.creadoPor === "trabajador") {
            const creador = await Trabajador.findById(miembro.creadorId)
              .select("nombre")
              .lean();
            if (creador) {
              miembro.creadorNombre = creador.nombre;
            }
          }
        }
        return miembro;
      })
    );

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
    const { id: creadorId, rol: creadoPor } = req.usuario;

    if (!nombreCompleto || !telefono || !mensualidad) {
      return res
        .status(400)
        .json({ error: "Nombre, teléfono y mensualidad son requeridos" });
    }

    const membresiaSeleccionada = await Membresia.findById(mensualidad);
    if (!membresiaSeleccionada) {
      return res.status(404).json({ error: "Membresía no encontrada" });
    }

    // Validar que no exista miembro con el mismo teléfono
    const miembroExiste = await Miembro.findOne({ telefono });
    if (miembroExiste) {
      return res.status(409).json({
        error: "Ya existe un miembro con este teléfono",
      });
    }

    // Validar entrenador (si se envía)
   let entrenadorValido = null;
   if (entrenador) {
     entrenadorValido = await Entrenador.findById(entrenador);

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
    const miembro = await Miembro.findOne({
      _id: req.params.id,
    }).populate("mensualidad entrenador");

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
    const { id: creadorId, rol: creadoPor } = req.usuario;

    const miembro = await Miembro.findOne({ _id: miembroId });
    if (!miembro) {
      return res.status(404).json({ error: "Miembro no encontrado" });
    }

    const updateData = {
      ...req.body,
      creadorId: creadorId,
      creadoPor: creadoPor,
    };

    const miembroActualizado = await Miembro.findByIdAndUpdate(
      miembroId,
      updateData,
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
    const { id: creadorId, rol: creadoPor } = req.usuario;
    const { meses, debe } = req.body;

    const miembro = await Miembro.findOne({ _id: miembroId });
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

    miembro.creadorId = creadorId;
    miembro.creadoPor = creadoPor;

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

    const result = await Miembro.deleteOne({ _id: miembroId });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: "Miembro no encontrado" });
    }

    res.json({ mensaje: "Miembro eliminado" });
  } catch (err) {
    res.status(500).json({ error: "Error al eliminar" });
  }
};
