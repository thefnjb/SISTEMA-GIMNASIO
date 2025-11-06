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

exports.verificarClientesMembresia = async (req, res) => {
    try {
        const { id } = req.params;
        const Miembro = require("../Modelos/Miembro");
        
        // Verificar si la membresía existe
        const membresia = await Membresia.findOne({ _id: id, gym: req.usuario.gym_id });
        
        if (!membresia) {
            return res.status(404).json({ error: "Membresía no encontrada" });
        }

        // Contar clientes que usan esta membresía
        const totalClientes = await Miembro.countDocuments({
            $or: [
                { mensualidad: id },
                { "historialMembresias.membresiaId": id }
            ]
        });
        
        res.status(200).json({ 
            clientesUsando: totalClientes,
            membresia: membresia
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: "Error al verificar la membresía" });
    }
}
exports.actualizarMembresia = async (req, res) => {
    try {
        const { id } = req.params;
        const { duracion, precio, turno } = req.body;
        const Miembro = require("../Modelos/Miembro");

        // Verificar si la membresía existe
        const membresia = await Membresia.findOne({ _id: id, gym: req.usuario.gym_id });
        
        if (!membresia) {
            return res.status(404).json({ error: "Membresía no encontrada" });
        }

        // Verificar si hay clientes usando esta membresía
        const totalClientes = await Miembro.countDocuments({
            $or: [
                { mensualidad: id },
                { "historialMembresias.membresiaId": id }
            ]
        });

        // Si hay clientes usando esta membresía, no permitir actualización
        if (totalClientes > 0) {
            return res.status(400).json({ 
                error: "No se puede actualizar la membresía",
                clientesUsando: totalClientes,
                message: `Esta membresía está siendo utilizada por ${totalClientes} cliente${totalClientes > 1 ? 's' : ''}. Por favor, actualiza o elimina primero los clientes que la usan antes de modificar la membresía.`
            });
        }

        // Si no hay clientes, permitir actualización
        const datosActualizar = { duracion, precio };
        if (turno) {
            datosActualizar.turno = turno;
        }

        const membresiaActualizada = await Membresia.findOneAndUpdate(
            { _id: id, gym: req.usuario.gym_id },
            datosActualizar,
            { new: true }
        );

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
        const Miembro = require("../Modelos/Miembro");
        
        // Verificar si la membresía existe
        const membresia = await Membresia.findOne({ _id: id, gym: req.usuario.gym_id });
        
        if (!membresia) {
            return res.status(404).json({ error: "Membresía no encontrada" });
        }

        // Contar clientes que usan esta membresía
        // Buscar clientes que tienen esta membresía en mensualidad o en historialMembresias
        const totalClientes = await Miembro.countDocuments({
            $or: [
                { mensualidad: id },
                { "historialMembresias.membresiaId": id }
            ]
        });
        
        // Si hay clientes usando esta membresía, retornar información
        if (totalClientes > 0) {
            return res.status(400).json({ 
                error: "No se puede eliminar la membresía",
                clientesUsando: totalClientes,
                message: `Esta membresía está siendo utilizada por ${totalClientes} cliente${totalClientes > 1 ? 's' : ''}. Por favor, actualiza o elimina primero los clientes que la usan.`
            });
        }

        // Si no hay clientes usando la membresía, eliminar
        await Membresia.findOneAndDelete({ _id: id, gym: req.usuario.gym_id });

        res.status(200).json({ message: "Membresía eliminada correctamente" });
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: "Error al eliminar la membresía" });
    }
};