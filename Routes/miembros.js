// Rutas/miembros.js
const express = require("express");
const router = express.Router();
const MiembrosController = require("../Controladores/miembros");
const auth = require("../Auth/Auth");
const Miembro = require("../Modelos/Miembro"); // Agregar esta importación

router.get("/miembros", auth, MiembrosController.getAllMiembros);
router.post("/registrarmiembros", auth, MiembrosController.registroMiembros);
router.patch('/actualizarmiembro/:id', auth, async (req, res) => {
  try {
    console.log('Datos recibidos:', req.body); // Para depuración

    const actualizacion = {
      ...req.body,
      renovacion: req.body.renovacion,
      mesesRenovacion: req.body.mesesRenovacion,
      fechaInicioRenovacion: req.body.fechaInicioRenovacion,
      estado: req.body.estado
    };

    const miembroActualizado = await Miembro.findByIdAndUpdate(
      req.params.id,
      actualizacion,
      { new: true }
    ).populate('membresia').populate('entrenador');

    if (!miembroActualizado) {
      return res.status(404).json({ error: 'Miembro no encontrado' });
    }

    console.log('Miembro actualizado:', miembroActualizado); // Para depuración
    res.json(miembroActualizado);
  } catch (error) {
    console.error('Error detallado:', error);
    res.status(500).json({ 
      error: error.message,
      detalles: 'Error al actualizar el miembro'
    });
  }
});
router.delete("/eliminarmiembro/:id", auth, MiembrosController.eliminarMiembro);


module.exports = router;
