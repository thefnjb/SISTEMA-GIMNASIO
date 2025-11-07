const mongoose = require("mongoose");

const MiembroSchema = new mongoose.Schema(
  {
    nombreCompleto: { type: String, required: true, trim: true },
    tipoDocumento: {
      type: String,
      enum: ["DNI", "CE"],
      required: true,
    },
    numeroDocumento: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      validate: {
        validator: function(v) {
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
    telefono: {
      type: String,
      required: true,
      unique: true, 
      trim: true,
      match: [/^\d{9}$/, "El teléfono debe tener exactamente 9 dígitos numéricos"],
    },
    fechaIngreso: { type: Date, default: Date.now },
    mensualidad: { type: mongoose.Schema.Types.ObjectId, ref: "membresias", required: true },
    entrenador: { type: mongoose.Schema.Types.ObjectId, ref: "Entrenador" },
    metodoPago: {
      type: String,
      enum: ["yape", "plin", "efectivo"],
      default: "efectivo",
    },
    estadoPago: { type: String, enum: ["Pagado", "Pendiente"], default: "Pendiente" },
    debe: { type: Number, default: 0 },
    estado: { 
  type: String, 
  enum: ["activo", "a_punto_de_vencer", "vencido", "congelado"], 
  default: "activo" 
},
congelacionSemanas: { type: Number, default: 0 },
    vencimiento: { type: Date },
    renovacion: { type: Date },
    mesesRenovacion: { type: String },
    fechaInicioRenovacion: { type: Date },
    creadoPor: {
      type: String,
      enum: ['admin', 'trabajador'],
      required: true
    },
    creadorId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: 'creadoPor' // Referencia dinámica
    },
    // Historial de membresías para el cálculo acumulado
    historialMembresias: [{
      membresiaId: { type: mongoose.Schema.Types.ObjectId, ref: "membresias" },
      precio: { type: Number, required: true },
      fechaRenovacion: { type: Date, default: Date.now },
      mesesAgregados: { type: Number, required: true },
      fotocomprobante: {
        data: { type: Buffer },
        contentType: { type: String }
      }
    }],
    // Suma total acumulada de todas las membresías
    totalAcumuladoMembresias: { type: Number, default: 0 }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Miembro", MiembroSchema);