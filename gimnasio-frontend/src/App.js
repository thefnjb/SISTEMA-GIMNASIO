import React from 'react';
import { useLocation } from 'react-router-dom';
import Login from './components/Login/login';
import Registro from './components/Registro/Registro';
import Panel from './Pages/Paginas/Panel';
import PanelTrabajador from './Pages/Paginas/PanelTrabajador';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ProtectedRoute from './components/ProteRuta/ProtectedRoute';
import { useColoresSistema } from './hooks/useColoresSistema';
import SkeletonLoader from './components/Skeleton/SkeletonLoader';
import './App.css';

function AppContent() {
  const location = useLocation();
  const coloresCargados = useColoresSistema();
  
  // Mostrar skeleton mientras se cargan los colores (solo en rutas protegidas)
  const isProtectedRoute = location.pathname === '/panel' || location.pathname === '/PanelTrabajador';
  
  if (isProtectedRoute && !coloresCargados) {
    return <SkeletonLoader />;
  }
  
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/registro" element={<Registro />} />
      <Route
        path="/panel"
        element={
          <ProtectedRoute rolRequerido="admin">
            <Panel />
          </ProtectedRoute>
        }
      />
      <Route
        path="/PanelTrabajador"
        element={
          <ProtectedRoute rolRequerido="trabajador">
            <PanelTrabajador />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;