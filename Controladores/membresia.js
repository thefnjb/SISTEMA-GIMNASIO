const Membresia = require("../Modelos/Membresia");

exports.crearMembresia = async (req, res) => {
    try{
        const {titulo,precio} = req.body;
        const nuevaMembresia = await Membresia.findOne({  gym: req.gym._id, titulo });
        if(nuevaMembresia){
            nuevaMembresia.precio =precio;
            await nuevaMembresia.save();
            return res.status(200).json({
                message:"Membresía actualizada correctamente",
            });
        }else{
            const nuevaMembresia = new Membresia({precio,titulo,gym:req.gym._id});
            await nuevaMembresia.save();
            res.status(200).json({
                message:"Membresía creada correctamente"
            });
        }
    }catch(err){
        console.log(err);
        res.status(500).json({
            error:"Error al crear la membresía"
        })
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
        const { titulo, precio } = req.body;

        const membresiaActualizada = await Membresia.findOneAndUpdate(
            { _id: id, gym: req.gym._id },
            { titulo, precio },
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