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

// Formatear nombre con primera letra en mayúscula
const formatearNombre = (nombre) => {
  if (!nombre) return "";
  return nombre
    .trim()
    .toLowerCase()
    .split(" ")
    .map(palabra => palabra.charAt(0).toUpperCase() + palabra.slice(1))
    .join(" ");
};

// --- Controladores Refactorizados ---

// Obtener todos los miembros del gimnasio (con filtros y paginación)
exports.getAllMiembros = async (req, res) => {
  try {
    const { id: userId, rol } = req.usuario;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || "";
    const skip = (page - 1) * limit;
    const all = req.query.all === "true";

    let filter = {};

    if (search) {
      filter.$or = [
        { nombreCompleto: { $regex: search, $options: "i" } },
        { telefono: { $regex: search, $options: "i" } },
        { numeroDocumento: { $regex: search, $options: "i" } },
      ];
    }

    let query = Miembro.find(filter)
      .populate("mensualidad")
      .populate("entrenador", "nombre telefono")
      .sort({ createdAt: -1 });

    if (!all) {
      query = query.skip(skip).limit(limit);
    }

    const miembrosDocs = await query.lean();

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
      page: all ? 1 : page,
      totalPages: all ? 1 : Math.ceil(total / limit),
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
      tipoDocumento,
      numeroDocumento,
      telefono,
      mensualidad,
      entrenador,
      metodoPago,
      estadoPago,
      debe,
      fechaIngreso,
    } = req.body;
    const { id: creadorId, rol: creadoPor } = req.usuario;

    if (!nombreCompleto || !telefono || !mensualidad || !tipoDocumento || !numeroDocumento) {
      return res
        .status(400)
        .json({ error: "Nombre, documento, teléfono y mensualidad son requeridos" });
    }

    // Validar formato de documento
    if (tipoDocumento === "DNI" && !/^\d{8}$/.test(numeroDocumento)) {
      return res.status(400).json({ error: "El DNI debe tener exactamente 8 dígitos" });
    }
    if (tipoDocumento === "CE" && !/^\d{9,12}$/.test(numeroDocumento)) {
      return res.status(400).json({ error: "El CE debe tener entre 9 y 12 dígitos" });
    }

    // Verificar si el documento ya existe
    const documentoExiste = await Miembro.findOne({ numeroDocumento });
    if (documentoExiste) {
      return res
        .status(409)
        .json({ error: "Ya existe un miembro con este número de documento" });
    }

    const membresiaSeleccionada = await Membresia.findById(mensualidad);
    if (!membresiaSeleccionada) {
      return res.status(404).json({ error: "Membresía no encontrada" });
    }

    const miembroExiste = await Miembro.findOne({ telefono });
    if (miembroExiste) {
      return res
        .status(409)
        .json({ error: "Ya existe un miembro con este teléfono" });
    }

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
      nombreCompleto: formatearNombre(nombreCompleto),
      tipoDocumento,
      numeroDocumento: numeroDocumento.trim(),
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
      historialMembresias: [
        {
          membresiaId: mensualidad,
          precio: membresiaSeleccionada.precio,
          fechaRenovacion: fechaInicio,
          mesesAgregados: membresiaSeleccionada.duracion,
        },
      ],
      totalAcumuladoMembresias: membresiaSeleccionada.precio,
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
    const { estado, congelacionSemanas } = req.body;

    const miembro = await Miembro.findById(miembroId);
    if (!miembro) {
      return res.status(404).json({ error: "Miembro no encontrado" });
    }

    let updateData = {
      ...req.body,
      creadorId,
      creadoPor,
    };

    // Formatear nombre si está presente
    if (updateData.nombreCompleto) {
      updateData.nombreCompleto = formatearNombre(updateData.nombreCompleto);
    }

    // Validar documento si se está actualizando
    if (updateData.tipoDocumento && updateData.numeroDocumento) {
      if (updateData.tipoDocumento === "DNI" && !/^\d{8}$/.test(updateData.numeroDocumento)) {
        return res.status(400).json({ error: "El DNI debe tener exactamente 8 dígitos" });
      }
      if (updateData.tipoDocumento === "CE" && !/^\d{9,12}$/.test(updateData.numeroDocumento)) {
        return res.status(400).json({ error: "El CE debe tener entre 9 y 12 dígitos" });
      }
      
      // Verificar si el documento ya existe en otro miembro
      const documentoExiste = await Miembro.findOne({ 
        numeroDocumento: updateData.numeroDocumento,
        _id: { $ne: miembroId }
      });
      if (documentoExiste) {
        return res
          .status(409)
          .json({ error: "Ya existe otro miembro con este número de documento" });
      }
    }

    if (estado === "congelado" && congelacionSemanas > 0) {
      const nuevasemanas = Number(congelacionSemanas);
      const vencimiento = new Date(miembro.vencimiento);
      vencimiento.setDate(vencimiento.getDate() + nuevasemanas * 7);
      updateData.vencimiento = vencimiento;
      updateData.congelacionSemanas = nuevasemanas;
    }

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

// Renovar membresía sin duplicar monto
exports.renovarMiembro = async (req, res) => {
  try {
    const { id: miembroId } = req.params;
    const { id: creadorId, rol: creadoPor } = req.usuario;
    const { mensualidadId, debe, metodoPago } = req.body;

    const miembro = await Miembro.findById(miembroId);
    if (!miembro) {
      return res.status(404).json({ error: "Miembro no encontrado" });
    }

    const membresiaNueva = await Membresia.findById(mensualidadId);
    if (!membresiaNueva) {
      return res.status(404).json({ error: "Membresía no encontrada" });
    }

    // Agregar solo la nueva membresía al historial
    miembro.historialMembresias.push({
      membresiaId: membresiaNueva._id,
      precio: membresiaNueva.precio,
      fechaRenovacion: new Date(),
      mesesAgregados: membresiaNueva.duracion,
    });

    // Recalcular total sin duplicar
    miembro.totalAcumuladoMembresias = miembro.historialMembresias.reduce(
      (total, item) => total + item.precio,
      0
    );

    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    const fechaBase =
      miembro.vencimiento && new Date(miembro.vencimiento) > hoy
        ? new Date(miembro.vencimiento)
        : hoy;

    const nuevoVencimiento = calcularVencimiento(
      fechaBase,
      membresiaNueva.duracion
    );

    miembro.mensualidad = membresiaNueva._id;
    miembro.vencimiento = nuevoVencimiento;
    miembro.estado = calcularEstado(nuevoVencimiento);
    if (debe !== undefined) miembro.debe = Number(debe);
    if (metodoPago) miembro.metodoPago = metodoPago;
    miembro.creadorId = creadorId;
    miembro.creadoPor = creadoPor;

    await miembro.save();

    res.json({ mensaje: "Renovación realizada correctamente", miembro });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al renovar la membresía" });
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
