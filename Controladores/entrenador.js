const Entrenador = require("../Modelos/Entrenador");

exports.crearEntrenador = async (req, res) => {
  try {
    const { nombre, edad, telefono, tipoDocumento, numeroDocumento } = req.body;

    // Validar formato de documento si se proporciona
    if (tipoDocumento && numeroDocumento) {
      if (tipoDocumento === "DNI" && !/^\d{8}$/.test(numeroDocumento)) {
        return res.status(400).json({ error: "El DNI debe tener exactamente 8 dígitos" });
      }
      if (tipoDocumento === "CE" && !/^\d{9,12}$/.test(numeroDocumento)) {
        return res.status(400).json({ error: "El CE debe tener entre 9 y 12 dígitos" });
      }
    }

    // Normalizar nombre para comparación (sin espacios extra, en minúsculas)
    const nombreNormalizado = nombre.trim().toLowerCase();

    // Verificar si ya existe un entrenador con el mismo nombre en el mismo gym
    const entrenadorExistente = await Entrenador.findOne({
      nombre: { $regex: new RegExp(`^${nombreNormalizado}$`, 'i') },
      gym: req.usuario.gym_id
    });

    if (entrenadorExistente) {
      return res.status(409).json({ 
        error: `Ya existe un entrenador con el nombre "${nombre}" en este gimnasio.` 
      });
    }

    // Normalizar documentos antes de guardar
    const tipoDocFinal = tipoDocumento ? String(tipoDocumento).trim() : undefined;
    const numeroDocFinal = numeroDocumento ? String(numeroDocumento).trim().replace(/\s+/g, '') : undefined;

    const nuevoEntrenador = new Entrenador({
      nombre: nombre.trim(),
      tipoDocumento: tipoDocFinal,
      numeroDocumento: numeroDocFinal,
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
    
    // Manejar error de duplicado del índice único
    if (err.code === 11000) {
      const campo = Object.keys(err.keyPattern)[0];
      if (campo === 'nombre') {
        return res.status(409).json({ error: "Ya existe un entrenador con este nombre en este gimnasio." });
      }
      return res.status(409).json({ error: "Ya existe un entrenador con estos datos." });
    }
    
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
      tipoDocumento: ent.tipoDocumento,
      numeroDocumento: ent.numeroDocumento,
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
    const { nombre, edad, telefono, tipoDocumento, numeroDocumento } = req.body;

    // Validar formato de documento si se proporciona
    if (tipoDocumento && numeroDocumento) {
      if (tipoDocumento === "DNI" && !/^\d{8}$/.test(numeroDocumento)) {
        return res.status(400).json({ error: "El DNI debe tener exactamente 8 dígitos" });
      }
      if (tipoDocumento === "CE" && !/^\d{9,12}$/.test(numeroDocumento)) {
        return res.status(400).json({ error: "El CE debe tener entre 9 y 12 dígitos" });
      }
    }

    // Verificar si el nombre ya existe en otro entrenador del mismo gym
    if (nombre) {
      const nombreNormalizado = nombre.trim().toLowerCase();
      const entrenadorConMismoNombre = await Entrenador.findOne({
        nombre: { $regex: new RegExp(`^${nombreNormalizado}$`, 'i') },
        gym: req.usuario.gym_id,
        _id: { $ne: id } // Excluir el entrenador actual
      });

      if (entrenadorConMismoNombre) {
        return res.status(409).json({ 
          error: `Ya existe otro entrenador con el nombre "${nombre}" en este gimnasio.` 
        });
      }
    }

    // Normalizar documentos antes de actualizar
    const tipoDocFinal = tipoDocumento ? String(tipoDocumento).trim() : undefined;
    const numeroDocFinal = numeroDocumento ? String(numeroDocumento).trim().replace(/\s+/g, '') : undefined;

    const datosActualizar = {
      ...(nombre && { nombre: nombre.trim() }),
      ...(edad && { edad }),
      ...(telefono && { telefono }),
      ...(tipoDocFinal && { tipoDocumento: tipoDocFinal }),
      ...(numeroDocFinal && { numeroDocumento: numeroDocFinal }),
    };

    const entrenadorActualizado = await Entrenador.findOneAndUpdate(
      { _id: id, gym: req.usuario.gym_id },
      datosActualizar,
      { new: true, runValidators: true }
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
    
    // Manejar error de duplicado del índice único
    if (err.code === 11000) {
      return res.status(409).json({ error: "Ya existe un entrenador con este nombre en este gimnasio." });
    }
    
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
// ...existing code...
exports.verificarClientesEntrenador = async (req, res) => {
  try {
    const { id } = req.params;
    const Miembro = require("../Modelos/Miembro");

    // verificar existencia del entrenador (opcional)
    const Entrenador = require("../Modelos/Entrenador");
    const entrenador = await Entrenador.findOne({ _id: id, gym: req.usuario.gym_id });
    if (!entrenador) return res.status(404).json({ error: "Entrenador no encontrado" });

    // Buscar en varias posibles referencias dentro de Miembro
    const totalMiembros = await Miembro.countDocuments({
      $or: [
        { entrenador: id },
        { entrenadorAsignado: id },
        { entrenadorId: id },
        { "historialEntrenadores.entrenadorId": id },
        { "historialEntrenadores._id": id }
      ]
    });

    return res.status(200).json({
      miembrosUsando: totalMiembros,
      clientesUsando: totalMiembros // por compatibilidad con frontend antiguo
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Error al verificar el entrenador" });
  }
};
// ...existing code...
// ✅ Actualizar solo la foto del entrenador
exports.actualizarFotoEntrenador = async (req, res) => {
  try {
    const { id } = req.params;

    // Buscar entrenador dentro del gimnasio del usuario
    const entrenador = await Entrenador.findOne({ _id: id, gym: req.usuario.gym_id });
    if (!entrenador) {
      return res.status(404).json({ error: "Entrenador no encontrado" });
    }

    // Verificar que haya archivo subido
    if (!req.file) {
      return res.status(400).json({ error: "No se ha subido ninguna imagen" });
    }

    // Guardar imagen en MongoDB
    entrenador.fotoPerfil.data = req.file.buffer;
    entrenador.fotoPerfil.contentType = req.file.mimetype;
    await entrenador.save();

    // Enviar respuesta con imagen en base64
    const fotoPerfilBase64 = `data:${entrenador.fotoPerfil.contentType};base64,${entrenador.fotoPerfil.data.toString("base64")}`;

    res.status(200).json({
      message: "Foto de perfil actualizada correctamente",
      fotoPerfil: fotoPerfilBase64,
    });
  } catch (error) {
    console.error("Error al actualizar foto del entrenador:", error);
    res.status(500).json({ error: "Error al actualizar la foto del entrenador" });
  }
};
