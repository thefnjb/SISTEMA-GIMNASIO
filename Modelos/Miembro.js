const mongoose = require("mongoose");

const MiembroSchema = new mongoose.Schema(
  {
    // Nuevo nombre completo (mantener compatibilidad con "nombre")
    nombreCompleto: { type: String, required: true, trim: true },
    nombre: { type: String }, // legado, no usar en nuevos registros

    // Teléfono con validación de 9 dígitos (mantener compatibilidad con "celular")
    telefono: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      match: [/^\d{9}$/, "El teléfono debe tener exactamente 9 dígitos numéricos"],
    },
    celular: { type: String }, // legado (sin índice único)

    fechaIngreso: { type: Date, default: Date.now },

    // Nueva referencia a mensualidad (mantener compatibilidad con "membresia")
    mensualidad: { type: mongoose.Schema.Types.ObjectId, ref: "membresias", required: true },
    membresia: { type: mongoose.Schema.Types.ObjectId, ref: "membresias" }, // legado

    // Entrenador
    entrenador: { type: mongoose.Schema.Types.ObjectId, ref: "Entrenador" },

    // Método de pago en minúsculas
    metodoPago: {
      type: String,
      enum: ["yape", "plin", "efectivo"],
      default: "efectivo",
    },

    // Estados y pagos (se conservan)
    estadoPago: { type: String, enum: ["Pagado", "Pendiente"], default: "Pendiente" },
    estado: { type: String, enum: ["activo", "a_punto_de_vencer", "vencido"], default: "activo" },

    // Vencimiento calculado
    vencimiento: { type: Date },

    // Renovaciones históricas (compatibilidad)
    renovacion: { type: Date },
    mesesRenovacion: { type: String },
    fechaInicioRenovacion: { type: Date },

    // Gimnasio
    gym: { type: mongoose.Schema.Types.ObjectId, ref: "gym" },
  },
  { timestamps: true }
);

// Índice único para teléfono (permitir documentos sin teléfono si fuera necesario)
MiembroSchema.index({ telefono: 1 }, { unique: true, sparse: true });

module.exports = mongoose.model("Miembro", MiembroSchema);