const Miembro = require("../Modelos/Miembro");
const Membresia = require("../Modelos/Membresia");

exports.getAllMiembros = async (req, res) => {
  try {
    const miembros = await Miembro.find()
      .populate("membresia")
      .populate("entrenador")
      .populate("gym");

    res.json(miembros);
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
      'nombre', 'celular', 'membresia', 'estadoPago', 
      'estado', 'ultimoPago', 'renovacion', 'metodoPago', 
      'entrenador', 'gym'
    ];

    const datosFiltrados = {};
    Object.keys(datosActualizados).forEach(key => {
      if (camposValidos.includes(key) && datosActualizados[key] !== undefined) {
        datosFiltrados[key] = datosActualizados[key];
      }
    });

    const miembroActualizado = await Miembro.findByIdAndUpdate(
      id,
      { $set: datosFiltrados },
      { new: true, runValidators: true }
    );

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
      nombre,
      celular,
      membresia,
      estadoPago,
      estado,
      ultimoPago,
      renovacion,
      metodoPago,
      entrenador,
      gym,
    } = req.body;

    const miembroExistente = await Miembro.findOne({ celular });
    if (miembroExistente) {
      return res.status(409).json({ error: "El miembro ya está registrado" });
    }

    const membresiaDoc = await Membresia.findById(membresia);
    if (!membresiaDoc) {
      return res.status(404).json({ error: "La membresía especificada no existe" });
    }

    const nuevoMiembro = new Miembro({
      nombre,
      celular,
      membresia,
      estadoPago,
      estado,
      ultimoPago,
      renovacion,
      metodoPago,
      entrenador,
      gym,
    });

    await nuevoMiembro.save();

    res.status(201).json({
      message: "Miembro registrado correctamente",
      miembro: nuevoMiembro,
    });
  } catch (err) {
    console.error("Error en registroMiembros:", err);
    res.status(500).json({ error: "Error al registrar el miembro" });
  }
};
