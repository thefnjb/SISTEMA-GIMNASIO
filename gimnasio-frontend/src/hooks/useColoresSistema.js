import { useEffect, useState } from 'react';
import api from '../utils/axiosInstance';

// Función para aplicar colores a las variables CSS
const aplicarColores = (colores) => {
  if (colores.colorSistema) {
    document.documentElement.style.setProperty('--color-sistema', colores.colorSistema);
  }
  if (colores.colorBotones) {
    document.documentElement.style.setProperty('--color-botones', colores.colorBotones);
  }
  if (colores.colorCards) {
    document.documentElement.style.setProperty('--color-cards', colores.colorCards);
  }
  if (colores.colorTablas) {
    document.documentElement.style.setProperty('--color-tablas', colores.colorTablas);
  }
  if (colores.colorAcentos) {
    document.documentElement.style.setProperty('--color-acentos', colores.colorAcentos);
  }
};

export const useColoresSistema = () => {
  const [coloresCargados, setColoresCargados] = useState(false);

  useEffect(() => {
    const cargarColores = async () => {
      // Solo cargar si hay un token (usuario autenticado)
      const token = sessionStorage.getItem('token');
      if (!token) {
        setColoresCargados(true);
        return;
      }

      try {
        const response = await api.get('/gym/datos-empresa');
        if (response.data.success && response.data.empresa) {
          // Aplicar colores inmediatamente y de forma síncrona
          aplicarColores(response.data.empresa);
          // Forzar re-aplicación para asegurar que se propague
          requestAnimationFrame(() => {
            aplicarColores(response.data.empresa);
          });
        }
      } catch (error) {
        // Silenciar errores si no hay token o no está autenticado
        if (error.response?.status !== 401) {
          console.error('Error al cargar colores del sistema:', error);
        }
      } finally {
        // Marcar como cargado después de un pequeño delay para asegurar que los colores se aplicaron
        setTimeout(() => {
          setColoresCargados(true);
        }, 150);
      }
    };

    cargarColores();

    // Escuchar cambios en los colores desde otros componentes
    const handleColorChange = (event) => {
      if (event.detail && event.detail.colores) {
        // Aplicar colores inmediatamente
        aplicarColores(event.detail.colores);
        
        // Forzar re-aplicación después de un pequeño delay para asegurar que se propague
        setTimeout(() => {
          aplicarColores(event.detail.colores);
        }, 50);
      }
    };

    // También escuchar cuando se recargan los colores desde el servidor
    const handleReloadColors = async () => {
      const token = sessionStorage.getItem('token');
      if (!token) return;
      
      try {
        const response = await api.get('/gym/datos-empresa');
        if (response.data.success && response.data.empresa) {
          aplicarColores(response.data.empresa);
        }
      } catch (error) {
        if (error.response?.status !== 401) {
          console.error('Error al recargar colores:', error);
        }
      }
    };

    window.addEventListener('coloresActualizados', handleColorChange);
    window.addEventListener('recargarColores', handleReloadColors);
    
    return () => {
      window.removeEventListener('coloresActualizados', handleColorChange);
      window.removeEventListener('recargarColores', handleReloadColors);
    };
  }, []);

  return coloresCargados;
};
