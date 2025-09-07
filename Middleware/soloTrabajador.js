const soloTrabajador = (req, res, next) => {
    if (req.usuario && req.usuario.rol === 'trabajador') {
        next();
    } else {
        res.status(403).json({ message: 'Acceso denegado. Se requiere rol de Trabajador.' });
    }
};

module.exports = soloTrabajador;
