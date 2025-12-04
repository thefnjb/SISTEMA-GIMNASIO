const mongoose = require('mongoose');

const gymSchema = new mongoose.Schema({
    usuario:{
        type:String,
        required: true,
    },
    password:{
        type:String,
        required: true,
    }
},{ timestamps: true });

const modal = mongoose.model("gym", gymSchema);
module.exports = modal;