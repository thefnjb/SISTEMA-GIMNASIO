
import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, rolRequerido }) => {
  const token = sessionStorage.getItem('token');
  const rol = sessionStorage.getItem('rol');

  if (!token) {
    // Si no hay token, redirige al login
    return <Navigate to="/" />;
  }

  if (rolRequerido && rol !== rolRequerido) {
    return <Navigate to="/" />;
  }

  return children;
};

export default ProtectedRoute;

