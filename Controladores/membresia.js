const Membresia = require("../Modelos/Membresia");

exports.crearMembresia = async (req, res) => {
    try {
        const { duracion, precio, turno } = req.body;

        // Buscar membresía con la misma duración y mismo turno
        const membresiaExistente = await Membresia.findOne({
            gym: req.usuario.gym_id,
            duracion,
            turno
        });

        if (membresiaExistente) {
            membresiaExistente.precio = precio;
            await membresiaExistente.save();
            return res.status(200).json({ message: "Membresía actualizada correctamente" });
        } else {
            const membresiaNueva = new Membresia({ duracion, precio, turno, gym: req.usuario.gym_id });
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
        let membresias;
        
        // Si es trabajador, buscar TODAS las membresías (sin filtro de gym)
        if (req.usuario.rol === 'trabajador') {
            membresias = await Membresia.find({});
        } else {
            // Si es admin, solo sus membresías
            membresias = await Membresia.find({ gym: req.usuario.gym_id });
        }
        
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
        const { duracion, precio } = req.body;

        const membresiaActualizada = await Membresia.findOneAndUpdate(
            { _id: id, gym: req.usuario.gym_id },
            { duracion, precio },
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
        const membresia = await Membresia.findOneAndDelete({ _id: id, gym: req.usuario.gym_id });

        if (!membresia) {
            return res.status(404).json({ error: "Membresía no encontrada" });
        }

        res.status(200).json({ message: "Membresía eliminada correctamente" });
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: "Error al eliminar la membresía" });
    }
};