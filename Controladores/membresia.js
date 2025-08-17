const Membresia = require("../Modelos/Membresia");

exports.crearMembresia = async (req, res) => {
    try {
        const { duracion, precio, turno } = req.body;

        // Buscar membresía con la misma duración y mismo turno
        const membresiaExistente = await Membresia.findOne({
            gym: req.gym._id,
            duracion,
            turno
        });

        if (membresiaExistente) {
            membresiaExistente.precio = precio;
            await membresiaExistente.save();
            return res.status(200).json({ message: "Membresía actualizada correctamente" });
        } else {
            const membresiaNueva = new Membresia({ duracion, precio, turno, gym: req.gym._id });
            await membresiaNueva.save();
            res.status(200).json({ message: "Membresía creada correctamente" });
        }
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: "Error al crear la membresía" });
    }
}
exports.verMembresia = async (req, res) => {
    try {
        const membresias = await Membresia.find({ gym: req.gym._id });
        res.status(200).json(membresias);
    } catch (err) {
        console.log(err);
        res.status(500).json({
            error: "Error al obtener las membresías"
        });
    }
}

exports.actualizarMembresia = async (req, res) => {
    try {
        const { id } = req.params;
        const { duracion, precio } = req.body; // Cambiado de titulo a duracion

        const membresiaActualizada = await Membresia.findOneAndUpdate(
            { _id: id, gym: req.gym._id },
            { duracion, precio }, // Cambiado de titulo a duracion
            { new: true }
        );

        if (!membresiaActualizada) {
            return res.status(404).json({ error: "Membresía no encontrada" });
        }

        res.status(200).json({
            message: "Membresía actualizada correctamente",
            membresia: membresiaActualizada,
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: "Error al actualizar la membresía" });
    }
};

exports.eliminarMembresia = async (req, res) => {
    try {
    const { id } = req.params;
    const membresia = await Membresia.findOneAndDelete({ _id: id, gym: req.gym._id });

    if (!membresia) {
      return res.status(404).json({ error: "Membresía no encontrada" });
    }

    res.status(200).json({ message: "Membresía eliminada correctamente" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Error al eliminar la membresía" });
  }
  };