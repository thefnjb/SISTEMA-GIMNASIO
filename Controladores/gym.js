const Gym = require('../Modelos/Gimnasio');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.login = async (req, res) => {
  try {
    const { Usuario, Contraseña } = req.body;

    if (!Usuario || !Contraseña) {
      return res.status(400).json({ error: "Usuario y contraseña son requeridos" });
    }

    const usuarioEncontrado = await Gym.findOne({ Usuario });
    if (!usuarioEncontrado) {
      return res.status(400).json({ error: "Usuario no encontrado" });
    }

    const contraseñaValida = await bcrypt.compare(Contraseña, usuarioEncontrado.Contraseña);
    if (!contraseñaValida) {
      return res.status(400).json({ error: "Contraseña incorrecta" });
    }

    const token = jwt.sign(
      { gym_id: usuarioEncontrado._id },
      process.env.JWT_SecretKey,
      { expiresIn: '24h' }
    );

    // 🔹 configuración de cookie (válida para localhost)
    const cookieOptions = {
      httpOnly: true,
      secure: false,     // true solo en producción con HTTPS
      sameSite: "lax",   // permite cookies entre localhost:3000 y 4000
      maxAge: 24 * 60 * 60 * 1000,
      path: "/"
    };

    res.cookie("cookie_token", token, cookieOptions);

    res.json({
      message: "Inicio de sesión exitoso",
      success: true,
      usuario: {
        id: usuarioEncontrado._id,
        usuario: usuarioEncontrado.Usuario
      }
    });
  } catch (err) {
    console.error("Error en login:", err);
    res.status(500).json({ error: "Error del servidor" });
  }
};

exports.registrar = async (req, res) => {
  try {
    const { Usuario, Contraseña } = req.body;

    const usuarioExistente = await Gym.findOne({ Usuario });
    if (usuarioExistente) {
      return res.status(400).json({ error: "Usuario ya existe" });
    }

    const nuevoUsuario = new Gym({
      Usuario,
      Contraseña: bcrypt.hashSync(Contraseña, 10)
    });

    await nuevoUsuario.save();
    res.json({ message: "Usuario registrado exitosamente", success: true });
  } catch (err) {
    res.status(500).json({ error: "Server Error" });
  }
};
