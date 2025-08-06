const Entrenador = require("../Modelos/Entrenador");

// Crear un nuevo entrenador
exports.crearEntrenador = async (req, res) => {
  try {
    const { nombre, edad, telefono } = req.body;

    const nuevoEntrenador = new Entrenador({
      nombre,
      edad,
      telefono,
      gym: req.gym._id
    });

    // si se sube foto, guardamos en Mongo
    if (req.file) {
      nuevoEntrenador.fotoPerfil.data = req.file.buffer;
      nuevoEntrenador.fotoPerfil.contentType = req.file.mimetype;
    }

    await nuevoEntrenador.save();
    res.status(201).json({ message: "Entrenador creado correctamente" });
  } catch (err) {
    console.error("Error al crear entrenador:", err);
    res.status(500).json({ error: "Error al crear el entrenador" });
  }
};

// Ver todos los entrenadores
exports.verEntrenadores = async (req, res) => {
  try {
    const entrenadores = await Entrenador.find({ gym: req.gym._id });

    const entrenadoresConImagen = entrenadores.map((ent) => ({
      _id: ent._id,
      nombre: ent.nombre,
      edad: ent.edad,
      telefono: ent.telefono,
      fotoPerfil: ent.fotoPerfil.data
        ? `data:${ent.fotoPerfil.contentType};base64,${ent.fotoPerfil.data.toString("base64")}`
        : null,
    }));

    res.status(200).json(entrenadoresConImagen);
  } catch (err) {
    console.error("Error al obtener entrenadores:", err);
    res.status(500).json({ error: "Error al obtener los entrenadores" });
  }
};

// Eliminar un entrenador
exports.eliminarEntrenador = async (req, res) => {
  try {
    const { id } = req.params;
    await Entrenador.findOneAndDelete({ _id: id, gym: req.gym._id });
    res.status(200).json({ message: "Entrenador eliminado correctamente" });
  } catch (err) {
    console.error("Error al eliminar entrenador:", err);
    res.status(500).json({ error: "Error al eliminar el entrenador" });
  }
};
