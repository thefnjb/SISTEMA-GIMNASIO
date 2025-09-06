const jwt = require('jsonwebtoken');

const authUnificado = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ message: 'Acceso denegado. Token no proporcionado.' });
        }

        const token = authHeader.split(' ')[1];
        let decoded;

        // Se intenta verificar el token primero como Admin, luego como Trabajador.
        try {
            // Intento 1: Verificar con la clave de Admin
            decoded = jwt.verify(token, process.env.JWT_SecretKey);
        } catch (adminError) {
            // Si falla, Intento 2: Verificar con la clave de Trabajador
            try {
                decoded = jwt.verify(token, process.env.JWT_TRABAJADOR_SECRET);
            } catch (trabajadorError) {
                // Si ambas claves fallan, el token es inválido.
                return res.status(401).json({ message: 'Token inválido.' });
            }
        }

        // Si llegamos aquí, el token fue verificado con una de las dos claves.
        // Ahora verificamos que el payload contenga un rol válido.
        if (decoded.rol === 'admin' || decoded.rol === 'trabajador') {
            req.usuario = decoded; // Adjuntamos la info del usuario a la request
            next(); // Damos paso al siguiente controlador
        } else {
            // El token es válido, pero el rol no tiene permisos.
            return res.status(403).json({ message: 'Rol no autorizado.' });
        }

    } catch (error) {
        // Captura cualquier otro error inesperado.
        console.error("Error en middleware authUnificado:", error);
        res.status(500).json({ message: 'Error interno en el servidor de autenticación.' });
    }
};

module.exports = authUnificado;
