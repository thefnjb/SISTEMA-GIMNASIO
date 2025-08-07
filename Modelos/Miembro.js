const mongoose = require("mongoose");

const MiembroSchema = new mongoose.Schema({
    nombre: { type: String, required: true },
    celular: { type: String, required: true, unique: true },
    fechaIngreso: { type: Date, default: Date.now },
    membresia: { type: mongoose.Schema.Types.ObjectId, ref: "membresias" },
    estadoPago: { type: String, enum: ["Pagado", "Pendiente"], default: "Pendiente" },
    estado: { type: String, enum: ["Activo", "Inactivo"], default: "Activo" },
    gym: { type: mongoose.Schema.Types.ObjectId, ref: "gym" },
    ultimoPago: { type: Date },
    renovacion: { type: Date },
    entrenador: { type: mongoose.Schema.Types.ObjectId, ref: "Entrenador" },
    metodoPago: { 
    type: String, 
    enum: ["Yape", "Plin", "Efectivo"], 
    default: "Efectivo" 
    }
}, { timestamps: true });

module.exports = mongoose.model("Miembro", MiembroSchema);