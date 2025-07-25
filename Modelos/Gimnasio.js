const mongoose = require('mongoose');

const gymSchema = new mongoose.Schema({
    Usuario:{
        type:String,
        required: true,

    },
    Contraseña:{
        type:String,
        required: true,
    }
},{ timestamps: true });

const modal = mongoose.model('gym', gymSchema);
module.exports = modal;