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