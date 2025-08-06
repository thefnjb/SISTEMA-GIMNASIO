const mongoose = require("mongoose");

const EntrenadorSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: true,
    trim: true,
  },
  edad: {
    type: Number,
    required: true,
  },
  telefono: {
    type: String,
    required: true,
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

module.exports = mongoose.model("Entrenador", EntrenadorSchema);
