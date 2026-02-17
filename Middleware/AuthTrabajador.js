const jwt = require('jsonwebtoken');

const authTrabajador = async (req, res, next) => {
    try {
        // 1. Buscar el header 'Authorization'
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ message: 'Acceso denegado. Token no proporcionado.' });
        }

        // 2. Extraer el token
        const token = authHeader.split(' ')[1];

        // 3. Verificar el token con la clave de TRABAJADOR
        let decoded;
        try {
            decoded = jwt.verify(token, process.env.JWT_TRABAJADOR_SECRET);
        } catch (jwtError) {
            // Log del error para debugging
            console.error('Error al verificar token de trabajador:', jwtError.name, jwtError.message);
            return res.status(401).json({ message: 'Token inválido o expirado.' });
        }

        // 4. Verificar que el rol sea 'trabajador'
        if (decoded.rol !== 'trabajador') {
            return res.status(403).json({ message: 'Acceso denegado. Se requiere rol de trabajador.' });
        }

        // 5. Guardar la info del usuario en la request y continuar
        req.usuario = decoded;
        next();

    } catch (error) {
        console.error('Error inesperado en authTrabajador:', error);
        res.status(500).json({ message: 'Error interno en la autenticación.' });
    }
};

module.exports = authTrabajador;
