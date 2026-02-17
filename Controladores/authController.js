const Gym = require('../Modelos/Gimnasio');
const Trabajador = require('../Modelos/Trabajador');
const RegistroAsistencia = require('../Modelos/RegistroAsistencia');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const AuthController = {

    // Función de login anterior (mantener por compatibilidad si es necesario)
    loginUnificado: async (req, res) => {
        try {
            const { usuario, password } = req.body;

            // 1. Buscar como Administrador (Gimnasio)
            let admin = await Gym.findOne({ usuario }).select('+password');
            if (admin) {
                const isMatch = await bcrypt.compare(password, admin.password);
                if (isMatch) {
                    const payload = { id: admin._id, rol: 'admin', gym_id: admin._id };
                    const token = jwt.sign(payload, process.env.JWT_SecretKey, { expiresIn: '8h' });
                    return res.json({ token, rol: 'admin' });
                }
            }

            // 2. Si no es admin, buscar como Trabajador
            let trabajador = await Trabajador.findOne({ nombreUsuario: usuario, activo: true }).select('+password');
            if (trabajador) {
                const isMatch = await bcrypt.compare(password, trabajador.password);
                if (isMatch) {
                    // Registrar entrada automática del trabajador
                    try {
                        // Verificar si ya tiene una entrada sin salida hoy
                        const hoy = new Date();
                        hoy.setHours(0, 0, 0, 0);
                        const manana = new Date(hoy);
                        manana.setDate(manana.getDate() + 1);

                        const entradaPendiente = await RegistroAsistencia.findOne({
                            trabajador: trabajador._id,
                            fechaEntrada: { $gte: hoy, $lt: manana },
                            fechaSalida: null
                        });

                        // Solo registrar entrada si no hay una pendiente
                        if (!entradaPendiente) {
                            const nuevoRegistro = new RegistroAsistencia({
                                trabajador: trabajador._id,
                                fechaEntrada: new Date(),
                                gym: trabajador.gym
                            });
                            await nuevoRegistro.save();
                        }
                    } catch (error) {
                        console.error("Error al registrar entrada automática:", error);
                        // No fallar el login si hay error al registrar entrada
                    }

                    const payload = { id: trabajador._id, rol: 'trabajador', gym_id: trabajador.gym };
                    const token = jwt.sign(payload, process.env.JWT_TRABAJADOR_SECRET, { expiresIn: '8h' });
                    return res.json({ token, rol: 'trabajador' });
                }
            }

            // 3. Si no se encuentra en ninguna tabla o la contraseña es incorrecta
            return res.status(401).json({ message: 'Credenciales inválidas' });

        } catch (error) {
            console.error("Error en login unificado:", error);
            res.status(500).json({ message: 'Error interno del servidor' });
        }
    },

    // Logout - Registrar salida automática para trabajadores
    logout: async (req, res) => {
        try {
            const { rol, id } = req.usuario || {};

            // Solo registrar salida si es trabajador
            if (rol === 'trabajador' && id) {
                try {
                    // Buscar la entrada más reciente sin salida
                    const registroPendiente = await RegistroAsistencia.findOne({
                        trabajador: id,
                        fechaSalida: null
                    }).sort({ fechaEntrada: -1 });

                    if (registroPendiente) {
                        registroPendiente.fechaSalida = new Date();
                        await registroPendiente.save();
                    }
                } catch (error) {
                    console.error("Error al registrar salida automática:", error);
                    // No fallar el logout si hay error al registrar salida
                }
            }

            res.json({ 
                success: true, 
                message: 'Sesión cerrada exitosamente' 
            });
        } catch (error) {
            console.error("Error en logout:", error);
            res.status(500).json({ message: 'Error interno del servidor' });
        }
    },

    // Recuperar contraseña - Cambiar contraseña solo con email
    recuperarCambiar: async (req, res) => {
        try {
            const { email, nuevaPassword } = req.body;

            if (!email || !nuevaPassword) {
                return res.status(400).json({ message: 'Email y nueva contraseña son requeridos' });
            }

            if (nuevaPassword.length < 6) {
                return res.status(400).json({ message: 'La contraseña debe tener al menos 6 caracteres' });
            }

            // Buscar gimnasio por email
            const gym = await Gym.findOne({ email: email.toLowerCase().trim() });
            if (!gym) {
                return res.status(404).json({ message: 'Email no encontrado en el sistema' });
            }

            // Cambiar contraseña directamente (solo verifica que el email exista)
            const hashedPassword = await bcrypt.hash(nuevaPassword, 10);
            gym.password = hashedPassword;
            await gym.save();

            return res.json({ 
                success: true, 
                message: 'Contraseña cambiada exitosamente'
            });

        } catch (error) {
            console.error("Error al cambiar contraseña:", error);
            res.status(500).json({ message: 'Error interno del servidor' });
        }
    }

};

module.exports = AuthController;
