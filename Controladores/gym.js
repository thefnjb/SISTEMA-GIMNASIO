const Gym = require('../Modelos/Gimnasio');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { obtenerPlantilla, obtenerTodasPlantillas } = require('../Servicios/plantillasColores');

exports.login = async (req, res) => {
  try {
    const { usuario, password } = req.body;

    if (!usuario || !password) {
      return res.status(400).json({ error: "Usuario y contraseña son requeridos" });
    }

    const admin = await Gym.findOne({ usuario });
    if (!admin) {
      return res.status(400).json({ error: "Usuario no encontrado" });
    }

    const passwordValida = await bcrypt.compare(password, admin.password);
    if (!passwordValida) {
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
        usuario: admin.usuario,
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
    const { usuario, password, nombreEmpresa, logoEmpresa, email, plantillaColor } = req.body;

    if (!usuario || !password || !nombreEmpresa || !email) {
      return res.status(400).json({ error: "Usuario, contraseña, nombre de empresa y email son requeridos" });
    }

    // Validar formato de email
    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: "Formato de email inválido" });
    }

    const usuarioExistente = await Gym.findOne({ usuario });
    if (usuarioExistente) {
      return res.status(400).json({ error: "Usuario ya existe" });
    }

    // Verificar si el email ya está en uso
    const emailExistente = await Gym.findOne({ email: email.toLowerCase().trim() });
    if (emailExistente) {
      return res.status(400).json({ error: "Este email ya está registrado" });
    }

    // Procesar logo: puede ser URL o base64/dataURL
    let logoProcesado = null;
    if (logoEmpresa) {
      if (typeof logoEmpresa === 'string') {
        // Si es data URL (data:image/...;base64,...)
        if (logoEmpresa.startsWith('data:')) {
          try {
            const matches = logoEmpresa.match(/^data:([^;]+);base64,(.+)$/);
            if (matches) {
              logoProcesado = {
                data: Buffer.from(matches[2], 'base64'),
                contentType: matches[1]
              };
            }
          } catch (err) {
            console.error('Error al procesar logo:', err);
            // Si hay error, continuar sin logo
            logoProcesado = null;
          }
        } else {
          // Si es una URL, guardarla como string
          logoProcesado = logoEmpresa;
        }
      }
    }

    // Obtener colores de la plantilla seleccionada
    const plantilla = obtenerPlantilla(plantillaColor || 'porDefecto');
    const colores = {
      colorSistema: plantilla.colorSistema,
      colorBotones: plantilla.colorBotones,
      colorCards: plantilla.colorCards,
      colorTablas: plantilla.colorTablas,
      colorAcentos: plantilla.colorAcentos,
      plantillaColor: plantillaColor || 'porDefecto'
    };

    const nuevoUsuario = new Gym({
      usuario: usuario.trim(),
      password: bcrypt.hashSync(password, 10),
      nombreEmpresa: nombreEmpresa.trim(),
      logoEmpresa: logoProcesado,
      email: email.toLowerCase().trim(),
      ...colores
    });

    await nuevoUsuario.save();
    
    // Devolver credenciales para mostrar al usuario
    res.json({ 
      message: "Gimnasio registrado exitosamente", 
      success: true,
      gym: {
        id: nuevoUsuario._id,
        nombreEmpresa: nuevoUsuario.nombreEmpresa,
        usuario: nuevoUsuario.usuario,
        email: nuevoUsuario.email
      },
      // Incluir credenciales para mostrar al usuario
      credenciales: {
        usuario: nuevoUsuario.usuario,
        password: password // Devolver la contraseña en texto plano solo para mostrar
      }
    });
  } catch (err) {
    if (err.code === 11000) {
      // Error de duplicado de MongoDB
      const campo = Object.keys(err.keyPattern)[0];
      return res.status(400).json({ 
        error: `El ${campo === 'usuario' ? 'usuario' : 'email'} ya está registrado` 
      });
    }
    
    res.status(500).json({ 
      error: "Error del servidor al registrar el gimnasio"
    });
  }
};

// Obtener datos del gimnasio actual (para admin y trabajadores)
exports.obtenerDatosEmpresa = async (req, res) => {
  try {
    const gymId = req.usuario.gym_id;
    
    const gym = await Gym.findById(gymId).select('-password');
    
    if (!gym) {
      return res.status(404).json({ error: "Gimnasio no encontrado" });
    }

    // Si el logo está guardado como Buffer en MongoDB, convertirlo a base64
    let logoEmpresa = gym.logoEmpresa;
    if (gym.logoEmpresa && gym.logoEmpresa.data) {
      logoEmpresa = `data:${gym.logoEmpresa.contentType || 'image/jpeg'};base64,${gym.logoEmpresa.data.toString('base64')}`;
    }

    res.json({
      success: true,
      empresa: {
        id: gym._id,
        nombreEmpresa: gym.nombreEmpresa,
        logoEmpresa: logoEmpresa,
        email: gym.email,
        usuario: gym.usuario,
        colorSistema: gym.colorSistema || '#D72838',
        colorBotones: gym.colorBotones || '#D72838',
        colorCards: gym.colorCards || '#ffffff',
        colorTablas: gym.colorTablas || '#D72838',
        colorAcentos: gym.colorAcentos || '#D72838',
        plantillaColor: gym.plantillaColor || 'porDefecto'
      }
    });
  } catch (err) {
    console.error("Error al obtener datos de empresa:", err);
    res.status(500).json({ error: "Error del servidor" });
  }
};

// Actualizar datos de la empresa
exports.actualizarDatosEmpresa = async (req, res) => {
  try {
    const gymId = req.usuario.gym_id;
    const { nombreEmpresa, email, logoEmpresa, plantillaColor } = req.body;

    const gym = await Gym.findById(gymId);
    
    if (!gym) {
      return res.status(404).json({ error: "Gimnasio no encontrado" });
    }

    // Actualizar campos
    if (nombreEmpresa) {
      gym.nombreEmpresa = nombreEmpresa.trim();
    }
    
    if (email) {
      // Validar formato de email
      const emailRegex = /^\S+@\S+\.\S+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ error: "Formato de email inválido" });
      }
      gym.email = email.toLowerCase().trim();
    }

    // Procesar logo: puede ser URL o base64/dataURL
    if (logoEmpresa !== undefined) {
      if (logoEmpresa === null || logoEmpresa === '') {
        // Eliminar logo
        gym.logoEmpresa = null;
      } else if (typeof logoEmpresa === 'string') {
        // Si es data URL (data:image/...;base64,...)
        if (logoEmpresa.startsWith('data:')) {
          try {
            const matches = logoEmpresa.match(/^data:([^;]+);base64,(.+)$/);
            if (matches) {
              gym.logoEmpresa = {
                data: Buffer.from(matches[2], 'base64'),
                contentType: matches[1]
              };
            } else {
              return res.status(400).json({ error: "Formato de imagen inválido" });
            }
          } catch (err) {
            return res.status(400).json({ error: "Error al procesar la imagen" });
          }
        } else {
          // Si es una URL, guardarla como string
          gym.logoEmpresa = logoEmpresa;
        }
      }
    }

    // Si se sube archivo con multer
    if (req.file) {
      gym.logoEmpresa = {
        data: req.file.buffer,
        contentType: req.file.mimetype
      };
    }

    // Actualizar plantilla de colores si se proporciona
    if (plantillaColor !== undefined) {
      const plantilla = obtenerPlantilla(plantillaColor);
      gym.plantillaColor = plantillaColor;
      gym.colorSistema = plantilla.colorSistema;
      gym.colorBotones = plantilla.colorBotones;
      gym.colorCards = plantilla.colorCards;
      gym.colorTablas = plantilla.colorTablas;
      gym.colorAcentos = plantilla.colorAcentos;
    }

    await gym.save();

    // Preparar respuesta con logo en base64 si está en Buffer
    let logoResponse = gym.logoEmpresa;
    if (gym.logoEmpresa && gym.logoEmpresa.data) {
      logoResponse = `data:${gym.logoEmpresa.contentType || 'image/jpeg'};base64,${gym.logoEmpresa.data.toString('base64')}`;
    }

    res.json({
      success: true,
      message: "Datos de empresa actualizados correctamente",
      empresa: {
        id: gym._id,
        nombreEmpresa: gym.nombreEmpresa,
        logoEmpresa: logoResponse,
        email: gym.email,
        usuario: gym.usuario,
        colorSistema: gym.colorSistema || '#D72838',
        colorBotones: gym.colorBotones || '#D72838',
        colorCards: gym.colorCards || '#ffffff',
        colorTablas: gym.colorTablas || '#D72838',
        colorAcentos: gym.colorAcentos || '#D72838',
        plantillaColor: gym.plantillaColor || 'porDefecto'
      }
    });
  } catch (err) {
    console.error("Error al actualizar datos de empresa:", err);
    res.status(500).json({ error: "Error del servidor" });
  }
};

// Obtener todas las plantillas de colores disponibles
exports.obtenerPlantillasColores = async (req, res) => {
  try {
    const plantillas = obtenerTodasPlantillas();
    res.json({
      success: true,
      plantillas
    });
  } catch (err) {
    console.error("Error al obtener plantillas:", err);
    res.status(500).json({ error: "Error del servidor" });
  }
};
