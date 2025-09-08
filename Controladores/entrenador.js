const Entrenador = require("../Modelos/Entrenador");

exports.crearEntrenador = async (req, res) => {
  try {
    const { nombre, edad, telefono } = req.body;

    const nuevoEntrenador = new Entrenador({
      nombre,
      edad,
      telefono,
      gym: req.usuario.gym_id
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
exports.verEntrenadores = async (req, res) => {
  try {
    let entrenadores;
         
    // ✅ Si es trabajador, buscar TODOS los entrenadores
    if (req.usuario.rol === 'trabajador') {
      entrenadores = await Entrenador.find({});
    } else {
      // Si es admin, solo sus entrenadores
      entrenadores = await Entrenador.find({ gym: req.usuario.gym_id });
    }

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

};exports.actualizarEntrenador = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, edad, telefono } = req.body;

    const entrenadorActualizado = await Entrenador.findOneAndUpdate(
      { _id: id, gym: req.usuario.gym_id },
      { nombre, edad, telefono },
      { new: true }
    );

    if (!entrenadorActualizado) {
      return res.status(404).json({ error: "Entrenador no encontrado" });
    }

    // Si se sube una nueva foto, actualizamos en Mongo
    if (req.file) {
      entrenadorActualizado.fotoPerfil.data = req.file.buffer;
      entrenadorActualizado.fotoPerfil.contentType = req.file.mimetype;
      await entrenadorActualizado.save();
    }

    res.status(200).json({
      message: "Entrenador actualizado correctamente",
      entrenador: entrenadorActualizado,
    });
  } catch (err) {
    console.error("Error al actualizar entrenador:", err);
    res.status(500).json({ error: "Error al actualizar el entrenador" });
  }
};
exports.eliminarEntrenador = async (req, res) => {
  try {
    const { id } = req.params;
    await Entrenador.findOneAndDelete({ _id: id, gym: req.usuario.gym_id });
    res.status(200).json({ message: "Entrenador eliminado correctamente" });
  } catch (err) {
    console.error("Error al eliminar entrenador:", err);
    res.status(500).json({ error: "Error al eliminar el entrenador" });
  }
};

exports.verFotoPerfil = async (req, res) => {
  try {
    const entrenador = await Entrenador.findById(req.params.id);
    if (!entrenador || !entrenador.fotoPerfil.data) {
      return res.status(404).send("No se encontró la imagen.");
    }
    res.set("Content-Type", entrenador.fotoPerfil.contentType);
    res.send(entrenador.fotoPerfil.data);
  } catch (error) {
    res.status(500).send("Error al obtener la imagen.");
  }
};