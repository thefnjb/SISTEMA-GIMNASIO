const { error } = require('console');
const mongoose = require('mongoose');

// Desactivar logs de depuración de mongoose
mongoose.set('debug', false);

mongoose
  .connect('mongodb://localhost:27017/gymBackend')
  .then(async () => {
    try {
      const Miembro = require('../Modelos/Miembro');
      await Miembro.syncIndexes();
    } catch (_) {
      // Silencioso
    }
    console.log('Conexión exitosa a la base de datos');
  })
  .catch(() => {
    // Silenciar errores de conexión en consola
  });