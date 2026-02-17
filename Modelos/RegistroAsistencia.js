const mongoose = require('mongoose');

const registroAsistenciaSchema = new mongoose.Schema({
    trabajador: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Trabajador',
        required: true
    },
    fechaEntrada: {
        type: Date,
        required: true,
        default: Date.now
    },
    fechaSalida: {
        type: Date,
        default: null
    },
    gym: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'gym',
        required: true
    }
}, { timestamps: true });

// Índice para búsquedas eficientes
registroAsistenciaSchema.index({ trabajador: 1, fechaEntrada: -1 });
registroAsistenciaSchema.index({ gym: 1, fechaEntrada: -1 });

module.exports = mongoose.model("RegistroAsistencia", registroAsistenciaSchema);

