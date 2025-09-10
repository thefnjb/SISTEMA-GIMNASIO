const Trabajador = require('../Modelos/Trabajador');
const Gym = require('../Modelos/Gimnasio');
const bcrypt = require('bcryptjs');

const TrabajadorController = {
    // Crear nuevo trabajador
    crearTrabajador : async (req, res) => {
    try {
        const { nombre, nombreUsuario, password } = req.body;

        // Encriptar contraseña
        const hashedPassword = await bcrypt.hash(password, 10);

        const nuevoTrabajador = new Trabajador({
        nombre,
        nombreUsuario,
        password: hashedPassword,
        passwordPlano: password,
        gym: req.usuario.gym_id,
        });

        await nuevoTrabajador.save();

        // Aquí solo se devuelve la contraseña en texto plano en la respuesta, no se guarda en DB
        res.status(201).json({
        message: "Trabajador creado exitosamente",
        trabajador: {
            _id: nuevoTrabajador._id,
            nombre: nuevoTrabajador.nombre,
            nombreUsuario: nuevoTrabajador.nombreUsuario,
            passwordTemporal: password, 
        },
        });
    } catch (err) {
        if (err.code === 11000) {
            return res.status(409).json({ error: "El nombre de usuario ya está en uso." });
        }
        console.error("Error al crear trabajador:", err);
        res.status(500).json({ error: "Error interno del servidor al crear el trabajador." });
    }
    },
    // Listar trabajadores del gym (solo para admin)
    obtenerTrabajadores: async (req, res) => {
        try {
            const { search } = req.query;
            let query = { gym: req.usuario.gym_id };

            if (search) {
                const searchRegex = new RegExp(search, 'i');
                query.$or = [
                    { nombre: searchRegex },
                    { nombreUsuario: searchRegex },
                ];
            }

            const trabajadores = await Trabajador.find(query)
                .select('nombre nombreUsuario rol gym passwordPlano activo') // mostramos el campo passwordPlano
                .populate('gym', 'nombre');

            res.json({
                trabajadores,
                total: trabajadores.length
            });

        } catch (error) {
            console.error(error);
            res.status(500).json({ error: "Error al obtener trabajadores" });
        }
    },

    // Desactivar trabajador
    desactivarTrabajador: async (req, res) => {
        try {
            const { id } = req.params;
            // Add this line for debugging
            console.log(`Attempting to deactivate worker with ID: ${id} for gym ID: ${req.usuario.gym_id}`);

            const trabajador = await Trabajador.findOneAndUpdate(
                { _id: id, gym: req.usuario.gym_id },
                { activo: false },
                { new: true }
            ).select('-password');

            if (!trabajador) {
                // Add more specific logging here
                console.log(`Worker with ID: ${id} not found or not associated with gym ID: ${req.usuario.gym_id}`);
                return res.status(404).json({ error: "Trabajador no encontrado" });
            }

            res.json({ mensaje: "Trabajador desactivado exitosamente", trabajador });

        } catch (error) {
            console.error("Error in desactivarTrabajador:", error); // More specific error message
            res.status(500).json({ error: "Error al desactivar trabajador" });
        }
    },

    // Activar trabajador
    activarTrabajador: async (req, res) => {
        try {
            const { id } = req.params;

            const trabajador = await Trabajador.findOneAndUpdate(
                { _id: id, gym: req.usuario.gym_id },
                { activo: true },
                { new: true }
            ).select('-password');

            if (!trabajador) {
                return res.status(404).json({ error: "Trabajador no encontrado" });
            }

            res.json({ mensaje: "Trabajador activado exitosamente", trabajador });

        } catch (error) {
            console.error(error);
            res.status(500).json({ error: "Error al activar trabajador" });
        }
    },

    // Actualizar trabajador
    actualizarTrabajador: async (req, res) => {
        try {
            const { id } = req.params;
            const { nombreUsuario, password } = req.body;

            if (!nombreUsuario) {
                return res.status(400).json({ error: "El nombre de usuario es requerido." });
            }

            const trabajador = await Trabajador.findOne({ _id: id, gym: req.usuario.gym_id });
            if (!trabajador) {
                return res.status(404).json({ error: "Trabajador no encontrado." });
            }

            if (nombreUsuario !== trabajador.nombreUsuario) {
                const existe = await Trabajador.findOne({ nombreUsuario });
                if (existe) {
                    return res.status(400).json({ error: "El nuevo nombre de usuario ya está en uso." });
                }
                trabajador.nombreUsuario = nombreUsuario;
            }

            if (password) {
                const salt = await bcrypt.genSalt(10);
                trabajador.password = await bcrypt.hash(password, salt);
                trabajador.passwordPlano = password; // actualizamos también el password plano
            }

            await trabajador.save();

            const trabajadorActualizado = trabajador.toObject();
            delete trabajadorActualizado.password;

            res.json({ mensaje: "Trabajador actualizado exitosamente.", trabajador: trabajadorActualizado });

        } catch (error) {
            console.error("Error al actualizar trabajador:", error);
            res.status(500).json({ error: "Error interno del servidor al actualizar." });
        }
    },

    eliminarTrabajador: async (req, res) => {
        try {
            const { id } = req.params;
            const trabajador = await Trabajador.findByIdAndDelete(id);
            if (!trabajador) return res.status(404).json({ error: "Trabajador no encontrado" });
            res.status(200).json({ mensaje: "Trabajador eliminado exitosamente" });
        } catch (error) {
            res.status(500).json({ error: "Error al eliminar trabajador", detalle: error.message });
        }
    },
};

module.exports = TrabajadorController;
