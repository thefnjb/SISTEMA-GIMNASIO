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
        }
        },{
        timestamps: true
});
module.exports = moogose.model("ClientesporDia", ClientesporDia);