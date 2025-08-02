const Miembro = require("../Modelos/Miembro");
const Membresia = require("../Modelos/Membresia");

// Obtener todos los miembros
exports.getAllMiembros = async (req, res) => {
  try {
    let { skip = 0, limit = 10 } = req.query;
    skip = parseInt(skip);
    limit = parseInt(limit);

    const miembros = await Miembro.find()
      .populate("membresia entrenador", "titulo precio nombre edad")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalMiembros = await Miembro.countDocuments();

    res.status(200).json({
      message: miembros.length ? "Miembros encontrados" : "No hay miembros registrados",
      miembros,
      totalMiembros,
    });
  } catch (err) {
    console.error("Error en getAllMiembros:", err);
    res.status(500).json({ error: "Error al obtener los miembros" });
  }
};

// Registrar un miembro nuevo
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
    } = req.body;

    // Verificar si ya existe miembro con el mismo celular
    const miembroExistente = await Miembro.findOne({ celular });
    if (miembroExistente) {
      return res.status(409).json({ error: "El miembro ya está registrado" });
    }

    // Validar que la membresía exista
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
