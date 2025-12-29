const mongoose = require('mongoose');

const gymSchema = new mongoose.Schema({
    usuario:{
        type:String,
        required: true,
        unique: true,
    },
    password:{
        type:String,
        required: true,
    },
    nombreEmpresa:{
        type:String,
        required: true,
        trim: true,
    },
    logoEmpresa:{
        type: mongoose.Schema.Types.Mixed, // Puede ser String (URL) o Object {data: Buffer, contentType: String}
        default: null,
    },
    email:{
        type:String,
        required: true,
        trim: true,
        lowercase: true,
        match: [/^\S+@\S+\.\S+$/, 'Por favor ingresa un email válido'],
    },
    colorSistema:{
        type:String,
        default: '#D72838', // Color para el sistema (fondos, gradientes)
        trim: true,
    },
    colorBotones:{
        type:String,
        default: '#D72838', // Color para los botones
        trim: true,
    },
    colorCards:{
        type:String,
        default: '#ffffff', // Color para las tarjetas/cards
        trim: true,
    },
    colorTablas:{
        type:String,
        default: '#D72838', // Color para encabezados de tablas
        trim: true,
    },
    colorAcentos:{
        type:String,
        default: '#D72838', // Color para acentos y elementos destacados
        trim: true,
    },
    plantillaColor:{
        type:String,
        default: 'porDefecto', // Nombre de la plantilla de colores seleccionada
        trim: true,
    },
    precioClientePorDia:{
        type:Number,
        default: 7, // Precio por defecto para clientes por día
        min: 0
    },
    precioTurnoManana:{
        type:Number,
        default: 80, // Precio por defecto para turno mañana
        min: 0
    },
    precioTurnoTarde:{
        type:Number,
        default: 100, // Precio por defecto para turno tarde
        min: 0
    },
    precioTurnoNoche:{
        type:Number,
        default: 120, // Precio por defecto para turno noche
        min: 0
    }
},{ timestamps: true });

const modal = mongoose.model("gym", gymSchema);
module.exports = modal;