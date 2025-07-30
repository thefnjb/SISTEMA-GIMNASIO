const moogose = require('mongoose');

const EntrenadorSchema = moogose.Schema({
    nombre:{
        type: String,
        required: true,
        trim: true,
    },
    edad:{
        type: Number,
        required: true,
        
    },
    fotoPerfil:{
        type: String,
        default:""
    },
    gym:{
        type: moogose.Schema.Types.ObjectId,
        ref: 'gym',
        required: true
    }
    },{
    timestamps: true
});

module.exports = moogose.model("Entrenador", EntrenadorSchema);