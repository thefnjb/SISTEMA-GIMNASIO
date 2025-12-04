const mongoose = require('mongoose');

const trabajadorSchema = new mongoose.Schema({
    nombre: {
        type: String,
        required: true,
        trim: true
    },
    tipoDocumento: {
        type: String,
        enum: ["DNI", "CE"],
        trim: true,
    },
    numeroDocumento: {
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
