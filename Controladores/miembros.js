const Miembro = require("../Modelos/Miembro");
const Membresia = require("../Modelos/Membresia");

function calcularVencimiento(fechaIngreso, meses) {
  const base = new Date(fechaIngreso);
  const venc = new Date(base);
  venc.setMonth(venc.getMonth() + Number(meses || 1));
  return venc;
}

function calcularEstado(vencimiento, umbralDias = 7) {
  if (!vencimiento) return "vencido";
  const hoy = new Date();
  const msRestantes = vencimiento.getTime() - hoy.getTime();
  if (msRestantes < 0) return "vencido";
  const dias = Math.ceil(msRestantes / (1000 * 60 * 60 * 24));
  if (dias <= umbralDias) return "a_punto_de_vencer";
  return "activo";
}

exports.getAllMiembros = async (req, res) => {
  try {
    const miembros = await Miembro.find()
      .populate("mensualidad")
      .populate("membresia") // compatibilidad
      .populate("entrenador")
      .populate("gym");

    // normalizar salida
    const salida = miembros.map((m) => ({
      _id: m._id,
      nombreCompleto: m.nombreCompleto || m.nombre,
      telefono: m.telefono || m.celular,
      fechaIngreso: m.fechaIngreso,
      mensualidad: m.mensualidad || m.membresia,
      entrenador: m.entrenador,
      metodoPago: (m.metodoPago || "efectivo").toLowerCase(),
      vencimiento: m.vencimiento,
      estado: calcularEstado(m.vencimiento),
    }));

    res.json(salida);
  } catch (error) {
    console.error("Error en getAllMiembros:", error);
    res.status(500).json({ error: "Error al obtener miembros" });
  }
};

exports.actualizarMiembro = async (req, res) => {
  try {
    const { id } = req.params;
    const datosActualizados = req.body;

    // Validar que el ID sea válido
    if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ error: "ID de miembro inválido" });
    }

    // Verificar que haya al menos un campo para actualizar
    if (Object.keys(datosActualizados).length === 0) {
      return res.status(400).json({ error: "No se proporcionaron datos para actualizar" });
    }

    // Filtrar solo los campos válidos del modelo
    const camposValidos = [
      'nombreCompleto', 'telefono', 'mensualidad', 'membresia', 'estadoPago',
      'estado', 'renovacion', 'metodoPago', 'entrenador', 'gym', 'fechaIngreso'
    ];

    const datosFiltrados = {};
    Object.keys(datosActualizados).forEach(key => {
      if (camposValidos.includes(key) && datosActualizados[key] !== undefined) {
        datosFiltrados[key] = datosActualizados[key];
      }
    });

    // si cambió fechaIngreso o mensualidad y no hay vencimiento explícito, recalcular
    let updateDoc = { $set: datosFiltrados };
    if ((datosFiltrados.fechaIngreso || datosFiltrados.mensualidad || datosFiltrados.membresia) && !datosActualizados.vencimiento) {
      const miembroActual = await Miembro.findById(id).populate('mensualidad').populate('membresia');
      const mensualidadRef = datosFiltrados.mensualidad || datosFiltrados.membresia || miembroActual?.mensualidad || miembroActual?.membresia;
      const mensualidadDoc = mensualidadRef ? await Membresia.findById(mensualidadRef) : null;
      const meses = mensualidadDoc?.duracion || 1;
      const baseFecha = datosFiltrados.fechaIngreso ? new Date(datosFiltrados.fechaIngreso) : miembroActual.fechaIngreso;
      const nuevoVenc = calcularVencimiento(baseFecha, meses);
      updateDoc.$set.vencimiento = nuevoVenc;
      updateDoc.$set.estado = calcularEstado(nuevoVenc);
    }

    const miembroActualizado = await Miembro.findByIdAndUpdate(id, updateDoc, { new: true, runValidators: true })
      .populate('mensualidad')
      .populate('entrenador');

    if (!miembroActualizado) {
      return res.status(404).json({ error: "Miembro no encontrado" });
    }

    res.status(200).json({
      message: "Miembro actualizado correctamente",
      miembro: miembroActualizado,
    });
  } catch (err) {
    console.error("Error en actualizarMiembro:", err);
    
    // Manejar errores específicos de validación
    if (err.name === 'ValidationError') {
      return res.status(400).json({ 
        error: "Datos inválidos", 
        details: Object.values(err.errors).map(e => e.message) 
      });
    }
    
    res.status(500).json({ error: "Error al actualizar el miembro" });
  }
};

exports.eliminarMiembro = async (req, res) => {
  try {
    const { id } = req.params;
    const miembroEliminado = await Miembro.findByIdAndDelete(id);

    if (!miembroEliminado) {
      return res.status(404).json({ error: "Miembro no encontrado" });
    }

    res.status(200).json({ message: "Miembro eliminado correctamente" });
  } catch (err) {
    console.error("Error en eliminarMiembro:", err);
    res.status(500).json({ error: "Error al eliminar el miembro" });
  }
};

exports.registroMiembros = async (req, res) => {
  try {
    const {
      nombreCompleto,
      telefono,
      fechaIngreso,
      mensualidad,
      estadoPago,
      metodoPago,
      entrenador,
      gym,
    } = req.body;

    // Validaciones básicas
    if (!nombreCompleto) return res.status(400).json({ error: "nombreCompleto es requerido" });
    if (!/^\d{9}$/.test(String(telefono || ""))) return res.status(400).json({ error: "telefono inválido, 9 dígitos" });
    if (!mensualidad) return res.status(400).json({ error: "mensualidad es requerida" });

    // Verificar duplicados por nombre Y teléfono antes de intentar guardar
    const miembroPorNombre = await Miembro.findOne({
      nombreCompleto: { $regex: new RegExp(`^${nombreCompleto.trim()}$`, 'i') }
    });
    if (miembroPorNombre) {
      return res.status(409).json({ error: `Ya existe un miembro registrado con el nombre "${nombreCompleto.trim()}"` });
    }

    const miembroPorTelefono = await Miembro.findOne({ telefono: telefono.trim() });
    if (miembroPorTelefono) {
      return res.status(409).json({ error: `El número de teléfono "${telefono.trim()}" ya está registrado.` });
    }

    const membresiaDoc = await Membresia.findById(mensualidad);
    if (!membresiaDoc) {
      return res.status(404).json({ error: "La membresía especificada no existe" });
    }

    const fechaIngresoDate = fechaIngreso ? new Date(`${fechaIngreso}T00:00:00`) : new Date();
    const vencimiento = calcularVencimiento(fechaIngresoDate, membresiaDoc.duracion);

    const nuevoMiembro = new Miembro({
      nombreCompleto: nombreCompleto.trim(), 
      telefono,
      fechaIngreso: fechaIngresoDate,
      mensualidad,
      estadoPago: estadoPago || "Pendiente",
      metodoPago: (metodoPago || "efectivo").toLowerCase(),
      entrenador,
      gym,
      vencimiento,
      estado: calcularEstado(vencimiento),
    });
    await nuevoMiembro.save();
    res.status(201).json({
      message: "Miembro registrado correctamente",
      miembro: nuevoMiembro,
    });
  } catch (err) {
    console.error("Error en registroMiembros:", err);
    if (err.code === 11000) {
      let campo = Object.keys(err.keyValue)[0];
      let valor = err.keyValue[campo];
      let mensaje = `El valor '${valor}' ya existe para el campo '${campo}'.`;
      if (campo === 'nombreCompleto') {
        mensaje = `Ya existe un miembro con el nombre "${valor}"`;
      } else if (campo === 'telefono') {
        mensaje = `El número de teléfono "${valor}" ya está registrado.`;
      }
      return res.status(409).json({ error: mensaje });
    }
    res.status(500).json({ error: "Error al registrar el miembro" });
  }
};

exports.verMiembro = async (req, res) => {
  try {
    const { id } = req.params;
    const m = await Miembro.findById(id).populate('mensualidad').populate('entrenador');
    if (!m) return res.status(404).json({ error: 'Miembro no encontrado' });
    return res.json({
      _id: m._id,
      nombreCompleto: m.nombreCompleto || m.nombre,
      telefono: m.telefono || m.celular,
      fechaIngreso: m.fechaIngreso,
      mensualidad: m.mensualidad || m.membresia,
      entrenador: m.entrenador,
      metodoPago: (m.metodoPago || 'efectivo').toLowerCase(),
      vencimiento: m.vencimiento,
      estado: calcularEstado(m.vencimiento),
    });
  } catch (err) {
    console.error('Error en verMiembro:', err);
    res.status(500).json({ error: 'Error al obtener el miembro' });
  }
};

exports.renovarMiembro = async (req, res) => {
  try {
    const { id } = req.params;
    const { meses } = req.body;
    const miembro = await Miembro.findById(id).populate('mensualidad');
    if (!miembro) return res.status(404).json({ error: 'Miembro no encontrado' });
    const mesesNum = Number(meses || 0);
    if (!mesesNum || mesesNum < 1) return res.status(400).json({ error: 'Meses inválidos' });

    const base = miembro.vencimiento && new Date(miembro.vencimiento) > new Date()
      ? new Date(miembro.vencimiento)
      : new Date();
    const nuevoVenc = calcularVencimiento(base, mesesNum);

    miembro.vencimiento = nuevoVenc;
    miembro.estado = calcularEstado(nuevoVenc);
    await miembro.save();

    res.json({ message: 'Renovación realizada', miembro });
  } catch (err) {
    console.error('Error en renovarMiembro:', err);
    res.status(500).json({ error: 'Error al renovar' });
  }
};