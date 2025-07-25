const mongoose = require('mongoose');

const Membresias = mongoose.Schema({

    ttulo:{
        type:String,
        required: true,
    },
    presio:{
        type:Number,
        required: true,
    },
    
    gym:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"gym",
        required:true
    }

})

const modalMembresias = mongoose.model('membresias', Membresias);
module.exports = modalMembresias;