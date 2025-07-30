const mongoose = require("mongoose");

const VisitasDiariasSchema = mongoose.Schema({
    nombre: { 
        type: String, 
        required: true, 
        trim: true },
    fecha: {
        type: Date,
        required: true,
        default: Date.now
    },
    monto:{
        type: Number,
        required: true,
        min: 0
    },
    estadoPago:{
        type: String,
        enum: ['Pagado', 'Pendiente'],
        default: 'Pendiente'
    },
    gym:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'gym',
        required:true,
    }
    },{
    timestamps:true
});

module.exports = mongoose.model("VisitasDiarias", VisitasDiariasSchema);