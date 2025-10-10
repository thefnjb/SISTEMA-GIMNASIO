require('dotenv').config();
const mongoose = require('mongoose');

// Desactivar logs de depuración de mongoose
mongoose.set('debug', false);

// Usar la URI definida en el archivo .env
const MONGO_URI = process.env.MONGO_URI;

mongoose
  .connect(MONGO_URI)
  .then(async () => {
    try {
      const Miembro = require('../Modelos/Miembro');
      await Miembro.syncIndexes();
    } catch (_) {
      // Silencioso
    }
    console.log('Conexión exitosa a la base de datos 😈👽');
    // Mostrar qué base de datos está usando mongoose
    try {
      console.log('🏚️', mongoose.connection.name);
    } catch (e) {
      // Ignorar si no está disponible
    }
  })
  .catch((err) => {
    console.error(
      'Error al conectar con la base de datos 🤷‍♂️🤷‍♀️:',
      err && err.message ? err.message : err
    );
  });
