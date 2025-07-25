const Gym = require('../Modelos/Gimnasio');

exports.login = async (req, res) => {
    try {
        const { Usuario, Contraseña } = req.body;
        // Buscar usuario y contraseña en la base de datos
        const usuarioEncontrado = await Gym.findOne({ Usuario, Contraseña });
        if (!usuarioEncontrado) {
            return res.status(401).json({
                error: "Credenciales incorrectas"
            });
        }
        res.status(200).json({
            message: "Inicio de sesión exitoso",
            usuario: Usuario
        });
    } catch (err) {
        res.status(500).json({
            error: "Server Error"
        });
    }
}