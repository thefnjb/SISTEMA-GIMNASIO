const mongoose = require("mongoose");

const UsuarioSchema = mongoose.Schema({
    nombre: { type: String, required: true },
    fechaIngreso: { type: Date, default: Date.now },
    celular: { type: String },
    membresía: { type: mongoose.Schema.Types.ObjectId, ref: 'Membresia' },
    estadoPago: { type: String, enum: ['Pagado', 'Pendiente'], default: 'Pendiente' },
    estado: { type: String, enum: ['Activo', 'Inactivo'], default: 'Activo' },
    gym:{type:mongoose.Schema.Types.ObjectId,ref:'gym',required:true, },
    ultimoPago: { type: Date },
    renovacion: { type: Date },
    entrenador: { type: mongoose.Schema.Types.ObjectId, ref: 'Entrenador' }
});

const Miembro = mongoose.model("Miembro", UsuarioSchema);
module.exports = Miembro;