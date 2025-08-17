// Controladores/miembros.js
const Miembro = require("../Modelos/Miembro");
const Membresia = require("../Modelos/Membresia");

// Función para calcular nuevo estado según vencimiento
const calcularEstado = (fechaVencimiento) => {
  if (!fechaVencimiento) return "inactivo";
  return new Date(fechaVencimiento) < new Date() ? "inactivo" : "activo";
};

// Función para calcular vencimiento sumando meses a una fecha base
const calcularVencimiento = (fechaBase, meses) => {
  const f = new Date(fechaBase);
  f.setMonth(f.getMonth() + Number(meses));
  return f;
};

// Obtener todos los miembros
exports.getAllMiembros = async (req, res) => {
  try {
    const miembros = await Miembro.find()
      .populate("mensualidad")
      .populate("membresia")
      .populate("entrenador")
      .populate("gym");
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
      mensualidad,
      entrenador,
      metodoPago,
      estadoPago,
      debe,
    } = req.body;

    const nuevaMembresia = await Membresia.findById(mensualidad);
    if (!nuevaMembresia) {
      return res.status(404).json({ error: "Membresía no encontrada" });
    }

    const nuevoMiembro = new Miembro({
      nombreCompleto,
      telefono,
      mensualidad,
      entrenador,
      metodoPago,
      estadoPago,
      debe: debe || 0,
      vencimiento: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 1 mes por defecto
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
    const { nombreCompleto, telefono, mensualidad, entrenador, metodoPago, estadoPago, debe } =
      req.body;

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
// Renovar membresía de un miembro
exports.renovarMiembro = async (req, res) => {
  try {
    const { id } = req.params;
    const { meses, debe } = req.body; // ⚡ nombres exactos enviados desde frontend

    const miembro = await Miembro.findById(id);
    if (!miembro) return res.status(404).json({ error: "Miembro no encontrado" });

    const mesesNum = Number(meses || 0);
    if (!mesesNum || mesesNum < 1)
      return res.status(400).json({ error: "Meses inválidos" });

    // Determinar fecha base: vencimiento actual si es futura, sino hoy
    const base = miembro.vencimiento && new Date(miembro.vencimiento) > new Date()
      ? new Date(miembro.vencimiento)
      : new Date();

    // Calcular nuevo vencimiento sumando meses
    const nuevoVenc = new Date(base);
    nuevoVenc.setMonth(nuevoVenc.getMonth() + mesesNum);

    miembro.vencimiento = nuevoVenc;
    miembro.estado = nuevoVenc < new Date() ? "inactivo" : "activo";
    miembro.mesesRenovacion = mesesNum;
    miembro.fechaInicioRenovacion = new Date();

    // Actualiza deuda si se envía
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
