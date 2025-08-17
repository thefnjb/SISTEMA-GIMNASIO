const mongoose = require('mongoose');

const Membresias = mongoose.Schema({
    duracion: {
        type: Number,
        required: true,
    },
    precio: {
        type: Number,
        required: true,
    },
    turno: {                // <-- Agregado
        type: String,
        required: true,
    },
    gym: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'gym',
        required: true,
    }
});

const modalMembresias = mongoose.model('membresias', Membresias);
module.exports = modalMembresias;
