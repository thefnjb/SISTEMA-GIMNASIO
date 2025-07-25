const { error } = require('console');
const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/gymBackend')
.then(()=> console.log('Conexión exitosa a la base de datos')).catch(error=>{
    console.log(error)
});