const Gym = require('../Modelos/Gimnasio');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.login = async (req, res) => {
  try {
    const { Usuario, Contraseña } = req.body;

    if (!Usuario || !Contraseña) {
      return res.status(400).json({ error: "Usuario y contraseña son requeridos" });
    }

    const admin = await Gym.findOne({ Usuario });
    if (!admin) {
      return res.status(400).json({ error: "Usuario no encontrado" });
    }

    const contraseñaValida = await bcrypt.compare(Contraseña, admin.Contraseña);
    if (!contraseñaValida) {
      return res.status(400).json({ error: "Contraseña incorrecta" });
    }

    // --- ¡ESTA ES LA CORRECCIÓN IMPORTANTE! ---
    // Creamos el payload AÑADIENDO el ID y el ROL
    const payload = {
      id: admin._id,       // ID del usuario/admin
      rol: 'admin',      // Asignamos manualmente el rol de 'admin'
      gym_id: admin._id  // Para el admin, su ID y el del gym son el mismo
    };

    // Firmamos el token con el payload correcto
    const token = jwt.sign(
      payload,
      process.env.JWT_SecretKey, // O la clave secreta que uses para admins
      { expiresIn: '24h' }
    );

    // Devolvemos el token correcto en el JSON
    res.json({
      token, // El token con la información correcta
      message: "Inicio de sesión exitoso",
      success: true,
      usuario: {
        id: admin._id,
        usuario: admin.Usuario,
        rol: 'admin' // Informamos al frontend que el rol es admin
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
