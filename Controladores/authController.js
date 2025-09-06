const Gym = require('../Modelos/Gimnasio');
const Trabajador = require('../Modelos/Trabajador');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const AuthController = {
    login: async (req, res) => {
        try {
            console.log("--- EJECUTANDO NUEVO CÓDIGO DE LOGIN ---");
            const { usuario, password } = req.body;

            if (!usuario || !password) {
                return res.status(400).json({ 
                    message: "Usuario y contraseña son requeridos" 
                });
            }

            // PASO 1: Buscar primero en Trabajadores
            const trabajador = await Trabajador.findOne({ 
                nombreUsuario: usuario,
                activo: true 
            }).populate('gym').select('+password');

            if (trabajador) {
                const passwordValido = await bcrypt.compare(password, trabajador.password);
                if (!passwordValido) {
                    return res.status(401).json({ message: "Credenciales inválidas" });
                }

                // Crear payload correcto para trabajador
                const payload = { 
                    id: trabajador._id,
                    rol: trabajador.rol || 'trabajador', // Asignar rol por defecto si no existe
                    gym_id: trabajador.gym._id
                };
                
                // Firmar el token
                const token = jwt.sign(
                    payload,
                    process.env.JWT_TRABAJADOR_SECRET, // Usar la clave secreta para trabajadores
                    { expiresIn: '8h' }
                );

                // Enviar el token en la respuesta JSON (NO en cookies)
                return res.json({
                    message: "Login exitoso",
                    token: token, // <-- AQUÍ ESTÁ EL TOKEN
                    usuario: {
                        id: trabajador._id,
                        nombre: trabajador.nombre,
                        rol: trabajador.rol || 'trabajador',
                    }
                });
            }

            // PASO 2: Si no es trabajador, buscar en Administradores (Gym)
            const admin = await Gym.findOne({ Usuario: usuario }).select('+Contraseña');

            if (!admin) {
                return res.status(401).json({ message: "Usuario no encontrado" });
            }
            
            const passwordValido = await bcrypt.compare(password, admin.Contraseña);
            if (!passwordValido) {
                return res.status(401).json({ message: "Credenciales inválidas" });
            }

            // Crear payload correcto para admin
            const payload = { 
                id: admin._id, // <-- AHORA INCLUIMOS EL ID DEL ADMIN
                rol: 'admin',
                gym_id: admin._id // Para un admin, su ID es el mismo que el del gym
            };

            // Firmar el token
            const token = jwt.sign(
                payload,
                process.env.JWT_SecretKey, // Usar la clave secreta para admin
                { expiresIn: '8h' } 
            );

            // Enviar el token en la respuesta JSON (NO en cookies)
            res.json({
                message: "Login exitoso",
                token: token, // <-- AQUÍ ESTÁ EL TOKEN
                usuario: {
                    id: admin._id,
                    nombre: admin.Usuario,
                    rol: 'admin'
                }
            });

        } catch (error) {
            console.error("Error en el login:", error);
            res.status(500).json({ message: "Error interno del servidor" });
        }
    },
};

module.exports = AuthController;
