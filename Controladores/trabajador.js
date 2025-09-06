
const Trabajador = require('../Modelos/Trabajador');
const Gym = require('../Modelos/Gimnasio');
const bcrypt = require('bcryptjs');

const TrabajadorController = {
    // Crear nuevo trabajador
    crearTrabajador: async (req, res) => {
        try {
            const { nombre, nombreUsuario, password } = req.body;

            // Validaciones básicas
            if (!nombre || !nombreUsuario || !password) {
                return res.status(400).json({ 
                    error: "Todos los campos son requeridos" 
                });
            }

            // Verificar que el nombreUsuario no exista
            const trabajadorExiste = await Trabajador.findOne({ nombreUsuario });
            if (trabajadorExiste) {
                return res.status(400).json({ 
                    error: "El nombre de usuario ya existe" 
                });
            }

            // Encriptar contraseña
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            // Crear trabajador asociado al gym del admin
            const nuevoTrabajador = new Trabajador({
                nombre,
                nombreUsuario,
                password: hashedPassword,
                gym: req.usuario.gym_id 
            });

            await nuevoTrabajador.save();

            res.status(201).json({
                mensaje: "Trabajador creado exitosamente",
                trabajador: {
                    id: nuevoTrabajador._id,
                    nombre: nuevoTrabajador.nombre,
                    nombreUsuario: nuevoTrabajador.nombreUsuario,
                    rol: nuevoTrabajador.rol,
                    gym: nuevoTrabajador.gym
                }
            });

        } catch (error) {
            console.error(error);
            res.status(500).json({ error: "Error interno del servidor" });
        }
    },

    // Listar trabajadores del gym (solo para admin)
    obtenerTrabajadores: async (req, res) => {
        try {
            const trabajadores = await Trabajador.find({ 
                gym: req.usuario.gym_id,
                activo: true 
            }).select('-password').populate('gym', 'Usuario');

            res.json({
                trabajadores,
                total: trabajadores.length
            });

        } catch (error) {
            console.error(error);
            res.status(500).json({ error: "Error al obtener trabajadores" });
        }
    },

    // Desactivar trabajador (no eliminar)
    desactivarTrabajador: async (req, res) => {
        try {
            const { id } = req.params;

            const trabajador = await Trabajador.findOneAndUpdate(
                { _id: id, gym: req.usuario.gym_id }, // Solo del mismo gym
                { activo: false },
                { new: true }
            ).select('-password');

            if (!trabajador) {
                return res.status(404).json({ 
                    error: "Trabajador no encontrado" 
                });
            }

            res.json({
                mensaje: "Trabajador desactivado exitosamente",
                trabajador
            });

        } catch (error) {
            console.error(error);
            res.status(500).json({ error: "Error al desactivar trabajador" });
        }
    }
};

module.exports = TrabajadorController;