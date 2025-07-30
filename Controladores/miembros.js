const Miembro = require("../Controladores/miembros");
const Membresia = require("../Controladores/membresia");



exports.getAllMiembros = async (req, res) => {
    try {
    let { skip = 0, limit = 10 } = req.query;
    skip = parseInt(skip);
    limit = parseInt(limit);

    const miembros = await Miembro.find({ gym: req.gym._id })
      .populate("membresia entrenador", "titulo precio nombre")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalMiembros = await Miembro.countDocuments({ gym: req.gym._id });

    res.status(200).json({
      message: miembros.length
        ? "Miembros encontrados"
        : "No hay miembros registrados",
      miembros,
      totalMiembros,
    });
  } catch (err) {
    console.error(err);
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
      entrenador,
    } = req.body;

    // Verificar si ya existe miembro con el mismo celular en el gym
    const miembroExistente = await Miembro.findOne({
      gym: req.gym._id,
      celular,
    });
    if (miembroExistente) {
      return res.status(409).json({ error: "El miembro ya está registrado" });
    }

    // Validar que la membresía exista
    const membresiaDoc = await Membresia.findOne({
      _id: membresia,
      gym: req.gym._id,
    });
    if (!membresiaDoc) {
      return res
        .status(404)
        .json({ error: "La membresía especificada no existe" });
    }

    const nuevoMiembro = new Miembro({
      nombre,
      celular,
      membresia,
      estadoPago,
      estado,
      gym: req.gym._id,
      ultimoPago,
      renovacion,
      entrenador,
    });

    await nuevoMiembro.save();

    res
      .status(201)
      .json({ message: "Miembro registrado correctamente", miembro: nuevoMiembro });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al registrar el miembro" });
  }
};