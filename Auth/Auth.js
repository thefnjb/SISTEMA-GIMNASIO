const Gym = require('../Modelos/Gimnasio'); 
const jwt = require('jsonwebtoken');

const auth = async (req, res, next) => {
    try {
        // Obtener el token de las cookies
        const token = req.cookies.cookie_token;
        
        if (!token) {
            return res.status(401).json({ error: "Token no encontrado" });
        }

        // Verificar el token
        const decode = jwt.verify(token, process.env.JWT_SecretKey);
        
        // Buscar el usuario en la base de datos
        req.gym = await Gym.findById(decode.gym_id).select('-Contraseña');
        
        next();

    } catch (error) {
        return res.status(401).json({ error: "Token no válido" });
    }
}

module.exports = auth;