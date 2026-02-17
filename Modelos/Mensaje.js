const mongoose = require('mongoose');

const mensajeSchema = new mongoose.Schema({
    remitente: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'gym', // El admin es el gym
        required: true
    },
    destinatario: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Trabajador',
        required: true
    },
    tipo: {
        type: String,
        enum: ['mensaje', 'alerta'],
        default: 'mensaje'
    },
    asunto: {
        type: String,
        trim: true,
        default: ''
    },
    contenido: {
        type: String,
        required: true,
        trim: true
    },
    leido: {
        type: Boolean,
        default: false
    },
    fechaLeido: {
        type: Date,
        default: null
    },
    gym: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'gym',
        required: true
    },
    prioridad: {
        type: String,
        enum: ['normal', 'alta', 'urgente'],
        default: 'normal'
    },
    respuesta: {
        type: String,
        default: null,
        trim: true
    },
    fechaRespuesta: {
        type: Date,
        default: null
    },
    mensajePadre: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Mensaje',
        default: null
    }
}, { timestamps: true });

// Índices para búsquedas eficientes
mensajeSchema.index({ destinatario: 1, createdAt: -1 });
mensajeSchema.index({ destinatario: 1, leido: 1 });
mensajeSchema.index({ gym: 1, createdAt: -1 });

module.exports = mongoose.model('Mensaje', mensajeSchema);

