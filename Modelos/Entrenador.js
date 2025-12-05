const mongoose = require("mongoose");

const EntrenadorSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: true,
    trim: true,
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
  edad: {
    type: Number,
    required: true,
  },
    telefono: {
      type: String,
      required: true,
      unique: true, 
      trim: true,
      match: [/^\d{9}$/, "El teléfono debe tener exactamente 9 dígitos numéricos"],
    },
  fotoPerfil: {
    data: Buffer, 
    contentType: String, 
  },
  gym: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "gym",
    required: true,
  },
}, { timestamps: true });

// Índice único compuesto para evitar nombres duplicados en el mismo gym
EntrenadorSchema.index({ nombre: 1, gym: 1 }, { unique: true });

module.exports = mongoose.model("Entrenador", EntrenadorSchema);
