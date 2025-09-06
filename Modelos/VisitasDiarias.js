const moogose = require('mongoose');

const ClientesporDia = moogose.Schema({
    nombre:{
        type: String,
        required: true,
        trim: true,
    },
    fecha:{
        type: Date,
        required: true,
        default: Date.now
    },
    horaInicio:{
        type: String,
        required: true,
        trim: true,
        match: /^([0-1]\d|2[0-3]):([0-5]\d)$/, // Formato HH:mm de 24 horas
    },
    metododePago:{
        type: String,
        enum: ['Yape', 'Plin', 'Efectivo'],
        default: 'Efectivo'
    },
    gym:{
        type: moogose.Schema.Types.ObjectId,
        ref: 'gym',
        required: true
    },
    // CAMPOS NUEVOS PARA SEPARACIÓN DE DATOS:
    creadoPor:{
        type: String,
        enum: ['admin', 'trabajador'],
        required: true
    },
    creadorId:{
        type: moogose.Schema.Types.ObjectId,
        required: true,
        refPath: 'creadoPor' 
    }
},{
    timestamps: true
});

// Índice compuesto para optimizar consultas por gym, creador y creadorId
ClientesporDia.index({ gym: 1, creadoPor: 1, creadorId: 1 });

// Índice para consultas por fecha
ClientesporDia.index({ fecha: 1 });

module.exports = moogose.model("ClientesporDia", ClientesporDia);
