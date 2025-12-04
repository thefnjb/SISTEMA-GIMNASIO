const Trabajador = require('../Modelos/Trabajador');
const Gym = require('../Modelos/Gimnasio');
const bcrypt = require('bcryptjs');

const TrabajadorController = {
    // Crear nuevo trabajador
    crearTrabajador : async (req, res) => {
    try {
        const { nombre, tipoDocumento, numeroDocumento, nombreUsuario, password } = req.body;

        // Normalizar el nombre
        const nombreNormalizado = nombre.trim();

        // Validar que el nombre no esté en uso en el mismo gym
        const nombreExiste = await Trabajador.findOne({ 
            nombre: nombreNormalizado,
            gym: req.usuario.gym_id
        });
        if (nombreExiste) {
            return res.status(409).json({ 
                error: `Ya existe un trabajador con el nombre "${nombreNormalizado}" en este gimnasio.` 
            });
        }

        // Validar que el nombreUsuario no esté en uso antes de continuar
        const usuarioExiste = await Trabajador.findOne({ 
            nombreUsuario: nombreUsuario.trim(),
            gym: req.usuario.gym_id
        });
        if (usuarioExiste) {
            return res.status(409).json({ 
                error: `El nombre de usuario "${nombreUsuario.trim()}" ya está en uso. Por favor, elige otro nombre de usuario.` 
            });
        }

        // Validar formato de documento si se proporciona
        if (tipoDocumento && numeroDocumento) {
            if (tipoDocumento === "DNI" && !/^\d{8}$/.test(numeroDocumento)) {
                return res.status(400).json({ error: "El DNI debe tener exactamente 8 dígitos" });
            }
            if (tipoDocumento === "CE" && !/^\d{9,12}$/.test(numeroDocumento)) {
                return res.status(400).json({ error: "El CE debe tener entre 9 y 12 dígitos" });
            }
            
            // Normalizar el número de documento
            const numeroDocNormalizado = String(numeroDocumento).trim().replace(/\s+/g, '');
            const tipoDocNormalizado = String(tipoDocumento).trim();
            
            // Verificar si el documento ya existe en el mismo gym
            const documentoExiste = await Trabajador.findOne({ 
                tipoDocumento: tipoDocNormalizado, 
                numeroDocumento: numeroDocNormalizado,
                gym: req.usuario.gym_id
            });
            if (documentoExiste) {
                return res.status(409).json({ 
                    error: `Ya existe un trabajador con el ${tipoDocNormalizado} ${numeroDocNormalizado}.` 
                });
            }
        }

        // Encriptar contraseña
        const hashedPassword = await bcrypt.hash(password, 10);

        // Normalizar documentos antes de guardar
        const tipoDocFinal = tipoDocumento ? String(tipoDocumento).trim() : undefined;
        const numeroDocFinal = numeroDocumento ? String(numeroDocumento).trim().replace(/\s+/g, '') : undefined;

        const nuevoTrabajador = new Trabajador({
        nombre: nombreNormalizado,
        tipoDocumento: tipoDocFinal,
        numeroDocumento: numeroDocFinal,
        nombreUsuario: nombreUsuario.trim(),
        password: hashedPassword,
        passwordPlano: password,
        gym: req.usuario.gym_id,
        });

        await nuevoTrabajador.save();

        // Aquí solo se devuelve la contraseña en texto plano en la respuesta, no se guarda en DB
        res.status(201).json({
        message: "Trabajador creado exitosamente",
        trabajador: {
            _id: nuevoTrabajador._id,
            nombre: nuevoTrabajador.nombre,
            nombreUsuario: nuevoTrabajador.nombreUsuario,
            passwordTemporal: password, 
        },
        });
    } catch (err) {
        if (err.code === 11000) {
            return res.status(409).json({ error: "El nombre de usuario ya está en uso." });
        }
        console.error("Error al crear trabajador:", err);
        res.status(500).json({ error: "Error interno del servidor al crear el trabajador." });
    }
    },
    // Listar trabajadores del gym (solo para admin)
    obtenerTrabajadores: async (req, res) => {
        try {
            const { search } = req.query;
            let query = { gym: req.usuario.gym_id };

            if (search) {
                const searchRegex = new RegExp(search, 'i');
                query.$or = [
                    { nombre: searchRegex },
                    { nombreUsuario: searchRegex },
                    { numeroDocumento: searchRegex },
                ];
            }

            const trabajadores = await Trabajador.find(query)
                .select('nombre tipoDocumento numeroDocumento nombreUsuario rol gym passwordPlano activo') // mostramos el campo passwordPlano
                .populate('gym', 'nombre');

            res.json({
                trabajadores,
                total: trabajadores.length
            });

        } catch (error) {
            console.error(error);
            res.status(500).json({ error: "Error al obtener trabajadores" });
        }
    },

    // Desactivar trabajador
    desactivarTrabajador: async (req, res) => {
        try {
            const { id } = req.params;
            const trabajador = await Trabajador.findOneAndUpdate(
                { _id: id, gym: req.usuario.gym_id },
                { activo: false },
                { new: true }
            ).select('-password');

            if (!trabajador) {
                return res.status(404).json({ error: "Trabajador no encontrado" });
            }
            
            res.json({ mensaje: "Trabajador desactivado exitosamente", trabajador });

        } catch (error) {
            console.error("Error in desactivarTrabajador:", error); // More specific error message
            res.status(500).json({ error: "Error al desactivar trabajador" });
        }
    },

    // Activar trabajador
    activarTrabajador: async (req, res) => {
        try {
            const { id } = req.params;

            const trabajador = await Trabajador.findOneAndUpdate(
                { _id: id, gym: req.usuario.gym_id },
                { activo: true },
                { new: true }
            ).select('-password');

            if (!trabajador) {
                return res.status(404).json({ error: "Trabajador no encontrado" });
            }

            res.json({ mensaje: "Trabajador activado exitosamente", trabajador });

        } catch (error) {
            console.error(error);
            res.status(500).json({ error: "Error al activar trabajador" });
        }
    },

    // Actualizar trabajador
    actualizarTrabajador: async (req, res) => {
        try {
            const { id } = req.params;
            const { nombre, tipoDocumento, numeroDocumento, nombreUsuario, password } = req.body;

            if (!nombre) {
                return res.status(400).json({ error: "El nombre es requerido." });
            }
            if (!nombreUsuario) {
                return res.status(400).json({ error: "El nombre de usuario es requerido." });
            }

            // Validar formato de documento si se proporciona
            if (tipoDocumento && numeroDocumento) {
                if (tipoDocumento === "DNI" && !/^\d{8}$/.test(numeroDocumento)) {
                    return res.status(400).json({ error: "El DNI debe tener exactamente 8 dígitos" });
                }
                if (tipoDocumento === "CE" && !/^\d{9,12}$/.test(numeroDocumento)) {
                    return res.status(400).json({ error: "El CE debe tener entre 9 y 12 dígitos" });
                }
            }

            const trabajador = await Trabajador.findOne({ _id: id, gym: req.usuario.gym_id });
            if (!trabajador) {
                return res.status(404).json({ error: "Trabajador no encontrado." });
            }

            // Normalizar el nombre
            const nombreNormalizado = nombre.trim();

            // Verificar si el nombre ya existe en otro trabajador del mismo gym
            const nombreExiste = await Trabajador.findOne({ 
                nombre: nombreNormalizado,
                gym: req.usuario.gym_id,
                _id: { $ne: id } // Excluir el trabajador actual
            });
            if (nombreExiste) {
                return res.status(409).json({ 
                    error: `Ya existe otro trabajador con el nombre "${nombreNormalizado}" en este gimnasio.` 
                });
            }

            // Verificar si el documento ya existe en otro trabajador del mismo gym
            if (tipoDocumento && numeroDocumento) {
                const numeroDocNormalizado = String(numeroDocumento).trim().replace(/\s+/g, '');
                const tipoDocNormalizado = String(tipoDocumento).trim();
                const documentoExiste = await Trabajador.findOne({ 
                    tipoDocumento: tipoDocNormalizado,
                    numeroDocumento: numeroDocNormalizado,
                    gym: req.usuario.gym_id,
                    _id: { $ne: id } // Excluir el trabajador actual
                });
                if (documentoExiste) {
                    return res.status(409).json({ 
                        error: `Ya existe otro trabajador con el ${tipoDocNormalizado} ${numeroDocNormalizado}.` 
                    });
                }
            }

            trabajador.nombre = nombreNormalizado;
            if (tipoDocumento !== undefined) {
                trabajador.tipoDocumento = tipoDocumento ? String(tipoDocumento).trim() : undefined;
            }
            if (numeroDocumento !== undefined) {
                trabajador.numeroDocumento = numeroDocumento ? String(numeroDocumento).trim().replace(/\s+/g, '') : undefined;
            }

            if (nombreUsuario !== trabajador.nombreUsuario) {
                const existe = await Trabajador.findOne({ nombreUsuario });
                if (existe) {
                    return res.status(400).json({ error: "El nuevo nombre de usuario ya está en uso." });
                }
                trabajador.nombreUsuario = nombreUsuario;
            }

            if (password) {
                const salt = await bcrypt.genSalt(10);
                trabajador.password = await bcrypt.hash(password, salt);
                trabajador.passwordPlano = password; // actualizamos también el password plano
            }

            await trabajador.save();

            const trabajadorActualizado = trabajador.toObject();
            delete trabajadorActualizado.password;

            res.json({ mensaje: "Trabajador actualizado exitosamente.", trabajador: trabajadorActualizado });

        } catch (error) {
            console.error("Error al actualizar trabajador:", error);
            res.status(500).json({ error: "Error interno del servidor al actualizar." });
        }
    },

    eliminarTrabajador: async (req, res) => {
        try {
            const { id } = req.params;
            const trabajador = await Trabajador.findByIdAndDelete(id);
            if (!trabajador) return res.status(404).json({ error: "Trabajador no encontrado" });
            res.status(200).json({ mensaje: "Trabajador eliminado exitosamente" });
        } catch (error) {
            res.status(500).json({ error: "Error al eliminar trabajador", detalle: error.message });
        }
    },
};

module.exports = TrabajadorController;
