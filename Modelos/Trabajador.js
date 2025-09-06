const mongoose = require('mongoose');

const trabajadorSchema = new mongoose.Schema({
    nombre: {
        type: String,
        required: true,
        trim: true
    },
    nombreUsuario: {
        type: String, 
        required: true,
        unique: true,
        trim: true
    },
    password: {
        type: String,
        required: true
    },
    rol: {
        type: String,
        default: 'trabajador'
    },
    gym: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'gym',  
        required: true
    },
    activo: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

module.exports = mongoose.model("Trabajador", trabajadorSchema);