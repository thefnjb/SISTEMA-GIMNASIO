import React from 'react';
import Login from './components/Login/login';
import Panel from './Pages/Paginas/Panel';
import PanelTrabajador from './Pages/Paginas/PanelTrabajador';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ProtectedRoute from './components/ProteRuta/ProtectedRoute';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
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
    </BrowserRouter>
  );
}

export default App;