const mongoose = require('mongoose');

const Membresias = mongoose.Schema({

    titulo:{
        type:String,
        required: true,
    },
    precio:{
        type:Number,
        required: true,
    },
    gym:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'gym',
        required:true,
    }
})

const modalMembresias = mongoose.model('membresias', Membresias);
module.exports = modalMembresias;