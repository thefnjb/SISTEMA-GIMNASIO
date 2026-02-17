const express = require('express');
const router = express.Router();
const authAdmin = require('../Middleware/authAdmin');
const authTrabajador = require('../Middleware/AuthTrabajador');
const authUnificado = require('../Middleware/AuthUnificado');
const MensajeController = require('../Controladores/mensaje');

// Rutas para administrador
router.post('/enviar', authAdmin, MensajeController.enviarMensaje);
router.post('/enviar-todos', authAdmin, MensajeController.enviarMensajeATodos);
router.get('/historial', authAdmin, MensajeController.obtenerHistorialEnviados);
router.get('/conversaciones', authAdmin, MensajeController.obtenerConversaciones);
router.post('/responder/:mensajeId', authAdmin, MensajeController.responderMensaje);
router.delete('/conversacion/:trabajadorId', authAdmin, MensajeController.eliminarConversacion);

// Rutas para trabajador
router.get('/mis-mensajes', authTrabajador, MensajeController.obtenerMensajes);
router.put('/marcar-leido/:mensajeId', authTrabajador, MensajeController.marcarComoLeido);
router.put('/marcar-todos-leidos', authTrabajador, MensajeController.marcarTodosComoLeidos);
router.get('/contador-no-leidos', authTrabajador, MensajeController.obtenerContadorNoLeidos);
router.delete('/eliminar/:mensajeId', authTrabajador, MensajeController.eliminarMensaje);
// Los trabajadores ya no pueden responder, solo el administrador puede responder

module.exports = router;

