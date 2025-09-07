
import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, rolRequerido }) => {
  const token = localStorage.getItem('token');
  const rol = localStorage.getItem('rol');

  if (!token) {
    // Si no hay token, redirige al login
    return <Navigate to="/" />;
  }

  if (rolRequerido && rol !== rolRequerido) {
    // Si se requiere un rol específico y el usuario no lo tiene,
    // podrías redirigir a una página de "acceso denegado" o de vuelta
    // a su panel principal si tienes uno genérico.
    // Por ahora, lo redirigimos al login por simplicidad.
    return <Navigate to="/" />;
  }

  return children;
};

export default ProtectedRoute;

