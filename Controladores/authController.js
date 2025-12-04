const Gym = require('../Modelos/Gimnasio');
const Trabajador = require('../Modelos/Trabajador');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const AuthController = {
    // Tu función de login anterior permanece aquí si la necesitas para otras cosas...
    login: async (req, res) => {
        // ... código existente
    },

    // NUEVA FUNCIÓN DE LOGIN UNIFICADO
    loginUnificado: async (req, res) => {
        try {
            const { usuario, password } = req.body;

            // 1. Buscar como Administrador (Gimnasio)
            let admin = await Gym.findOne({ usuario }).select('+password');
            if (admin) {
                const isMatch = await bcrypt.compare(password, admin.password);
                if (isMatch) {
                    const payload = { id: admin._id, rol: 'admin', gym_id: admin._id }; // CORREGIDO: Añadido gym_id
                    const token = jwt.sign(payload, process.env.JWT_SecretKey, { expiresIn: '8h' });
                    return res.json({ token, rol: 'admin' });
                }
            }

            // 2. Si no es admin, buscar como Trabajador
            let trabajador = await Trabajador.findOne({ nombreUsuario: usuario, activo: true }).select('+password');
            if (trabajador) {
                const isMatch = await bcrypt.compare(password, trabajador.password);
                if (isMatch) {
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
    }
};

module.exports = AuthController;
