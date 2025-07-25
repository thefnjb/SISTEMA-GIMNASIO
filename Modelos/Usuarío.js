const mongoose = require("mongoose");

const UsuarioSchema = mongoose.Schema({
    nombre: { type: String, required: true },
    edad: { type: Number, required: true },
    fechaIngreso: { type: Date, default: Date.now },
    celular: { type: String },
    dirección: { type: String },
    membresía: { type: mongoose.Schema.Types.ObjectId, ref: 'Membresia' },
    estadoPago: { type: String, enum: ['Pagado', 'Pendiente'], default: 'Pendiente' },
    estado: { type: String, enum: ['Activo', 'Inactivo'], default: 'Activo' },
    ultimoPago: { type: Date },
    próximaFactura: { type: Date },
    entrenador: { type: mongoose.Schema.Types.ObjectId, ref: 'Entrenador' }
});

const Usuario = mongoose.model("Usuario", UsuarioSchema);
module.exports = Usuario;