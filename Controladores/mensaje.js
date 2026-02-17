const Mensaje = require('../Modelos/Mensaje');
const Trabajador = require('../Modelos/Trabajador');
const Gym = require('../Modelos/Gimnasio');

const MensajeController = {
    // Enviar mensaje/alerta (solo admin)
    enviarMensaje: async (req, res) => {
        try {
            const { destinatarioId, tipo, asunto, contenido, prioridad } = req.body;
            const gymId = req.usuario.gym_id;

            // Validar que el destinatario existe y pertenece al mismo gym
            const trabajador = await Trabajador.findOne({
                _id: destinatarioId,
                gym: gymId
            });

            if (!trabajador) {
                return res.status(404).json({ error: 'Trabajador no encontrado' });
            }

            const mensaje = new Mensaje({
                remitente: gymId,
                destinatario: destinatarioId,
                tipo: tipo || 'mensaje',
                asunto: asunto || '',
                contenido,
                prioridad: prioridad || 'normal',
                gym: gymId
            });

            await mensaje.save();
            await mensaje.populate('destinatario', 'nombre nombreUsuario');

            res.status(201).json({
                mensaje: 'Mensaje enviado exitosamente',
                data: mensaje
            });
        } catch (error) {
            console.error('Error al enviar mensaje:', error);
            res.status(500).json({ error: 'Error al enviar el mensaje' });
        }
    },

    // Enviar mensaje a todos los trabajadores (solo admin)
    enviarMensajeATodos: async (req, res) => {
        try {
            const { tipo, asunto, contenido, prioridad } = req.body;
            const gymId = req.usuario.gym_id;

            // Obtener todos los trabajadores activos del gym
            const trabajadores = await Trabajador.find({
                gym: gymId,
                activo: true
            });

            if (trabajadores.length === 0) {
                return res.status(404).json({ error: 'No hay trabajadores activos' });
            }

            // Crear mensajes para cada trabajador
            const mensajes = trabajadores.map(trabajador => ({
                remitente: gymId,
                destinatario: trabajador._id,
                tipo: tipo || 'mensaje',
                asunto: asunto || '',
                contenido,
                prioridad: prioridad || 'normal',
                gym: gymId
            }));

            const mensajesCreados = await Mensaje.insertMany(mensajes);

            res.status(201).json({
                mensaje: `Mensaje enviado a ${mensajesCreados.length} trabajadores`,
                cantidad: mensajesCreados.length
            });
        } catch (error) {
            console.error('Error al enviar mensaje a todos:', error);
            res.status(500).json({ error: 'Error al enviar el mensaje' });
        }
    },

    // Obtener mensajes del trabajador
    obtenerMensajes: async (req, res) => {
        try {
            const trabajadorId = req.usuario.id;
            const { leido, tipo, limit = 50, page = 1 } = req.query;

            const query = {
                destinatario: trabajadorId
            };

            if (leido !== undefined) {
                query.leido = leido === 'true';
            }

            if (tipo) {
                query.tipo = tipo;
            }

            const skip = (parseInt(page) - 1) * parseInt(limit);

            const mensajes = await Mensaje.find(query)
                .populate('remitente', 'nombreEmpresa')
                .sort({ createdAt: -1 })
                .limit(parseInt(limit))
                .skip(skip);

            const total = await Mensaje.countDocuments(query);

            res.json({
                mensajes,
                total,
                page: parseInt(page),
                totalPages: Math.ceil(total / parseInt(limit))
            });
        } catch (error) {
            console.error('Error al obtener mensajes:', error);
            res.status(500).json({ error: 'Error al obtener los mensajes' });
        }
    },

    // Marcar mensaje como leído
    marcarComoLeido: async (req, res) => {
        try {
            const { mensajeId } = req.params;
            const trabajadorId = req.usuario.id;

            const mensaje = await Mensaje.findOne({
                _id: mensajeId,
                destinatario: trabajadorId
            });

            if (!mensaje) {
                return res.status(404).json({ error: 'Mensaje no encontrado' });
            }

            mensaje.leido = true;
            mensaje.fechaLeido = new Date();
            await mensaje.save();

            res.json({
                mensaje: 'Mensaje marcado como leído',
                data: mensaje
            });
        } catch (error) {
            console.error('Error al marcar mensaje como leído:', error);
            res.status(500).json({ error: 'Error al marcar el mensaje como leído' });
        }
    },

    // Marcar todos los mensajes como leídos
    marcarTodosComoLeidos: async (req, res) => {
        try {
            const trabajadorId = req.usuario.id;

            const resultado = await Mensaje.updateMany(
                {
                    destinatario: trabajadorId,
                    leido: false
                },
                {
                    leido: true,
                    fechaLeido: new Date()
                }
            );

            res.json({
                mensaje: `${resultado.modifiedCount} mensajes marcados como leídos`,
                cantidad: resultado.modifiedCount
            });
        } catch (error) {
            console.error('Error al marcar todos como leídos:', error);
            res.status(500).json({ error: 'Error al marcar los mensajes como leídos' });
        }
    },

    // Obtener contador de mensajes no leídos
    obtenerContadorNoLeidos: async (req, res) => {
        try {
            const trabajadorId = req.usuario.id;

            const contador = await Mensaje.countDocuments({
                destinatario: trabajadorId,
                leido: false
            });

            res.json({ contador });
        } catch (error) {
            console.error('Error al obtener contador:', error);
            res.status(500).json({ error: 'Error al obtener el contador' });
        }
    },

    // Eliminar mensaje
    eliminarMensaje: async (req, res) => {
        try {
            const { mensajeId } = req.params;
            const trabajadorId = req.usuario.id;

            const mensaje = await Mensaje.findOneAndDelete({
                _id: mensajeId,
                destinatario: trabajadorId
            });

            if (!mensaje) {
                return res.status(404).json({ error: 'Mensaje no encontrado' });
            }

            res.json({ mensaje: 'Mensaje eliminado exitosamente' });
        } catch (error) {
            console.error('Error al eliminar mensaje:', error);
            res.status(500).json({ error: 'Error al eliminar el mensaje' });
        }
    },

    // Responder mensaje (trabajador o admin)
    responderMensaje: async (req, res) => {
        try {
            const { mensajeId } = req.params;
            const { respuesta } = req.body;
            const userId = req.usuario?.id;
            const rol = req.usuario?.rol;

            // Validar que el usuario esté autenticado (esto debería estar garantizado por el middleware)
            if (!userId || !rol) {
                console.error('Error: Usuario no autenticado en responderMensaje', { userId, rol, usuario: req.usuario });
                return res.status(403).json({ error: 'No tienes permiso para realizar esta acción' });
            }

            if (!respuesta || !respuesta.trim()) {
                return res.status(400).json({ error: 'La respuesta es requerida' });
            }

            let mensaje;
            if (rol === 'trabajador') {
                // Trabajador responde a su mensaje
                mensaje = await Mensaje.findOne({
                    _id: mensajeId,
                    destinatario: userId
                });
            } else if (rol === 'admin') {
                // Admin responde a un mensaje que envió
                const gymId = req.usuario.gym_id;
                if (!gymId) {
                    console.error('Error: gym_id no encontrado para admin', { usuario: req.usuario });
                    return res.status(400).json({ error: 'ID de gimnasio no encontrado' });
                }
                mensaje = await Mensaje.findOne({
                    _id: mensajeId,
                    remitente: gymId
                });
            } else {
                return res.status(403).json({ error: 'No tienes permiso para responder este mensaje' });
            }

            if (!mensaje) {
                return res.status(404).json({ error: 'Mensaje no encontrado' });
            }

            // Si ya hay una respuesta, crear una nueva respuesta (conversación)
            if (mensaje.respuesta) {
                // Crear un nuevo mensaje como respuesta
                const nuevaRespuesta = new Mensaje({
                    remitente: rol === 'admin' ? req.usuario.gym_id : req.usuario.id, // Trabajador usa su ID
                    destinatario: rol === 'admin' ? mensaje.destinatario : mensaje.remitente, // Trabajador responde al remitente original (gym)
                    tipo: 'mensaje',
                    contenido: respuesta.trim(),
                    gym: mensaje.gym,
                    mensajePadre: mensajeId,
                    prioridad: 'normal'
                });
                await nuevaRespuesta.save();
                await nuevaRespuesta.populate('destinatario', 'nombre nombreUsuario nombreEmpresa');
                // Si el remitente es el gym (admin), poblar con nombreEmpresa, si es trabajador con nombre
                if (rol === 'admin') {
                    await nuevaRespuesta.populate('remitente', 'nombreEmpresa');
                } else {
                    await nuevaRespuesta.populate('remitente', 'nombre nombreUsuario');
                }
                
                res.json({
                    mensaje: 'Respuesta enviada exitosamente',
                    data: nuevaRespuesta
                });
            } else {
                // Primera respuesta, guardar en el mensaje original
                mensaje.respuesta = respuesta.trim();
                mensaje.fechaRespuesta = new Date();
                await mensaje.save();
                
                res.json({
                    mensaje: 'Respuesta enviada exitosamente',
                    data: mensaje
                });
            }
        } catch (error) {
            console.error('Error al responder mensaje:', error);
            // No devolver 401 aquí, solo 500 para errores del servidor
            res.status(500).json({ error: 'Error al enviar la respuesta' });
        }
    },

    // Obtener historial de mensajes enviados (admin) - incluye respuestas
    obtenerHistorialEnviados: async (req, res) => {
        try {
            const gymId = req.usuario.gym_id;
            const { destinatarioId, limit = 50, page = 1 } = req.query;

            const query = {
                remitente: gymId,
                gym: gymId
            };

            if (destinatarioId) {
                query.destinatario = destinatarioId;
            }

            const skip = (parseInt(page) - 1) * parseInt(limit);

            // Obtener mensajes principales
            const mensajes = await Mensaje.find(query)
                .populate('destinatario', 'nombre nombreUsuario')
                .sort({ createdAt: -1 })
                .limit(parseInt(limit))
                .skip(skip);

            // Obtener respuestas para cada mensaje
            const mensajesConRespuestas = await Promise.all(
                mensajes.map(async (mensaje) => {
                    // Buscar respuestas (mensajes hijos)
                    const respuestas = await Mensaje.find({
                        mensajePadre: mensaje._id
                    })
                        .populate('remitente', 'nombre nombreUsuario nombreEmpresa')
                        .populate('destinatario', 'nombre nombreUsuario')
                        .sort({ createdAt: 1 });
                    
                    return {
                        ...mensaje.toObject(),
                        respuestas: respuestas
                    };
                })
            );

            const total = await Mensaje.countDocuments(query);

            res.json({
                mensajes: mensajesConRespuestas,
                total,
                page: parseInt(page),
                totalPages: Math.ceil(total / parseInt(limit))
            });
        } catch (error) {
            console.error('Error al obtener historial:', error);
            res.status(500).json({ error: 'Error al obtener el historial' });
        }
    },

    // Obtener todas las conversaciones (admin)
    obtenerConversaciones: async (req, res) => {
        try {
            const gymId = req.usuario.gym_id;

            // Obtener todos los mensajes enviados con sus respuestas
            const mensajes = await Mensaje.find({
                remitente: gymId,
                gym: gymId
            })
                .populate('destinatario', 'nombre nombreUsuario')
                .sort({ createdAt: -1 });

            // Agrupar por trabajador
            const conversacionesPorTrabajador = {};
            mensajes.forEach((mensaje) => {
                const trabajadorId = mensaje.destinatario._id.toString();
                if (!conversacionesPorTrabajador[trabajadorId]) {
                    conversacionesPorTrabajador[trabajadorId] = {
                        trabajador: mensaje.destinatario,
                        mensajes: []
                    };
                }
                conversacionesPorTrabajador[trabajadorId].mensajes.push(mensaje);
            });

            // Convertir a array y ordenar por último mensaje
            const conversaciones = Object.values(conversacionesPorTrabajador).map((conv) => ({
                ...conv,
                ultimoMensaje: conv.mensajes[0],
                totalMensajes: conv.mensajes.length,
                mensajesNoLeidos: conv.mensajes.filter((m) => !m.leido).length,
                tieneRespuestas: conv.mensajes.some((m) => m.respuesta)
            }));

            conversaciones.sort((a, b) => {
                const fechaA = new Date(a.ultimoMensaje.createdAt);
                const fechaB = new Date(b.ultimoMensaje.createdAt);
                return fechaB - fechaA;
            });

            res.json({ conversaciones });
        } catch (error) {
            console.error('Error al obtener conversaciones:', error);
            res.status(500).json({ error: 'Error al obtener las conversaciones' });
        }
    },

    // Eliminar todos los mensajes de una conversación (admin)
    eliminarConversacion: async (req, res) => {
        try {
            const { trabajadorId } = req.params;
            const gymId = req.usuario.gym_id;

            // Verificar que el trabajador existe y pertenece al mismo gym
            const trabajador = await Trabajador.findOne({
                _id: trabajadorId,
                gym: gymId
            });

            if (!trabajador) {
                return res.status(404).json({ error: 'Trabajador no encontrado' });
            }

            // Eliminar todos los mensajes enviados a este trabajador y sus respuestas
            const mensajes = await Mensaje.find({
                remitente: gymId,
                destinatario: trabajadorId,
                gym: gymId
            });

            // Obtener IDs de mensajes principales
            const mensajeIds = mensajes.map(m => m._id);

            // Eliminar respuestas (mensajes hijos)
            await Mensaje.deleteMany({
                mensajePadre: { $in: mensajeIds }
            });

            // Eliminar mensajes principales
            const resultado = await Mensaje.deleteMany({
                remitente: gymId,
                destinatario: trabajadorId,
                gym: gymId
            });

            res.json({
                mensaje: 'Conversación eliminada exitosamente',
                eliminados: resultado.deletedCount
            });
        } catch (error) {
            console.error('Error al eliminar conversación:', error);
            res.status(500).json({ error: 'Error al eliminar la conversación' });
        }
    }
};

module.exports = MensajeController;

