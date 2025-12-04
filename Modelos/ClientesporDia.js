const moogose = require('mongoose');

const ClientesporDia = moogose.Schema({
    nombre:{
        type: String,
        required: true,
        trim: true,
    },
    tipoDocumento:{
        type: String,
        enum: ["DNI", "CE"],
        trim: true,
    },
    numeroDocumento:{
        type: String,
        trim: true,
        validate: {
            validator: function(v) {
                if (!v) return true; // Opcional
                if (this.tipoDocumento === "DNI") {
                    return /^\d{8}$/.test(v);
                } else if (this.tipoDocumento === "CE") {
                    return /^\d{9,12}$/.test(v);
                }
                return false;
            },
            message: "DNI debe tener 8 dígitos, CE debe tener entre 9 y 12 dígitos"
        }
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
    monto: {
        type: Number,
        required: true,
        default: 7,
        min: 0
    },
    fotocomprobante: {
        data: { type: Buffer },
        contentType: { type: String }
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

ClientesporDia.index({ gym: 1, creadoPor: 1, creadorId: 1 });

ClientesporDia.index({ fecha: 1 });

module.exports = moogose.model("ClientesporDia", ClientesporDia);