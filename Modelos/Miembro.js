const mongoose = require("mongoose");

const MiembroSchema = new mongoose.Schema(
  {
    nombreCompleto: { type: String, required: true, trim: true },
    nombre: { type: String }, // legado

    telefono: {
      type: String,
      required: true,
      unique: true, // índice único directo
      trim: true,
      match: [/^\d{9}$/, "El teléfono debe tener exactamente 9 dígitos numéricos"],
    },

    celular: { type: String }, // legado
    fechaIngreso: { type: Date, default: Date.now },

    mensualidad: { type: mongoose.Schema.Types.ObjectId, ref: "membresias", required: true },
    membresia: { type: mongoose.Schema.Types.ObjectId, ref: "membresias" }, // legado
    entrenador: { type: mongoose.Schema.Types.ObjectId, ref: "Entrenador" },

    metodoPago: {
      type: String,
      enum: ["yape", "plin", "efectivo"],
      default: "efectivo",
    },

    estadoPago: { type: String, enum: ["Pagado", "Pendiente"], default: "Pendiente" },

    // 👇 NUEVO CAMPO PARA DEUDA
    debe: { type: Number, default: 0 },

    estado: { type: String, enum: ["activo", "a_punto_de_vencer", "vencido"], default: "activo" },
    vencimiento: { type: Date },
    renovacion: { type: Date },
    mesesRenovacion: { type: String },
    fechaInicioRenovacion: { type: Date },
    gym: { type: mongoose.Schema.Types.ObjectId, ref: "gym" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Miembro", MiembroSchema);
