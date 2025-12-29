import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminTrabajador } from '../Avatar/avatar';
import HomeIcon from '@mui/icons-material/Home';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import SplitText from '../TextAnimation/SplitText';
import api from '../../utils/axiosInstance';

const BarralateralTrabajador = ({ active, setActive }) => {
  const navigate = useNavigate();
  const [nombreEmpresa, setNombreEmpresa] = useState("");
  const [logoEmpresa, setLogoEmpresa] = useState(null);
  const [colorSistema, setColorSistema] = useState("#D72838");
  const [colorBotones, setColorBotones] = useState("#D72838");

  useEffect(() => {
    // Obtener datos de la empresa al montar el componente
    const obtenerDatosEmpresa = async () => {
      try {
        const response = await api.get('/gym/datos-empresa');
        console.log('Datos de empresa recibidos (BarralateralTrabajador):', response.data);
        if (response.data.success && response.data.empresa) {
          // Establecer nombre de empresa siempre que exista
          const nombre = response.data.empresa.nombreEmpresa;
          if (nombre && nombre.trim()) {
            setNombreEmpresa(nombre.trim());
            console.log('Nombre de empresa establecido (BarralateralTrabajador):', nombre.trim());
          }
          if (response.data.empresa.colorSistema) {
            setColorSistema(response.data.empresa.colorSistema);
          }
          if (response.data.empresa.colorBotones) {
            setColorBotones(response.data.empresa.colorBotones);
          }
          if (response.data.empresa.logoEmpresa) {
            setLogoEmpresa(response.data.empresa.logoEmpresa);
          }
        }
      } catch (error) {
        console.error('Error al obtener datos de la empresa:', error);
      }
    };

    obtenerDatosEmpresa();

    // Escuchar cambios en los colores del sistema y datos de la empresa
    const handleColoresActualizados = (event) => {
      if (event.detail && event.detail.colores) {
        const colores = event.detail.colores;
        if (colores.colorSistema) {
          setColorSistema(colores.colorSistema);
        }
        if (colores.colorBotones) {
          setColorBotones(colores.colorBotones);
        }
      }
    };

    const handleRecargarColores = async () => {
      await obtenerDatosEmpresa();
    };

    const handleDatosEmpresaActualizados = async (event) => {
      // Si el evento trae datos directamente, actualizar inmediatamente
      if (event.detail && event.detail.empresa) {
        const empresa = event.detail.empresa;
        if (empresa.nombreEmpresa) {
          setNombreEmpresa(empresa.nombreEmpresa.trim());
        }
        if (empresa.colorSistema) {
          setColorSistema(empresa.colorSistema);
        }
        if (empresa.colorBotones) {
          setColorBotones(empresa.colorBotones);
        }
        if (empresa.logoEmpresa) {
          setLogoEmpresa(empresa.logoEmpresa);
        }
      }
      // También recargar desde el servidor para asegurar sincronización
      await obtenerDatosEmpresa();
    };

    window.addEventListener('coloresActualizados', handleColoresActualizados);
    window.addEventListener('recargarColores', handleRecargarColores);
    window.addEventListener('datosEmpresaActualizados', handleDatosEmpresaActualizados);

    return () => {
      window.removeEventListener('coloresActualizados', handleColoresActualizados);
      window.removeEventListener('recargarColores', handleRecargarColores);
      window.removeEventListener('datosEmpresaActualizados', handleDatosEmpresaActualizados);
    };
  }, []);

  const handleLogout = () => {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('rol');
    navigate('/');
  };

  return (
    <div className="flex w-full h-full">
      <aside
        className="flex flex-col h-full min-h-screen text-white shadow-2xl w-full max-w-full md:max-w-72 overflow-y-auto overflow-x-hidden custom-scrollbar"
        style={{
          background: `linear-gradient(to bottom, var(--color-sistema, ${colorSistema}) 0%, #1a1a1a 50%, #0a0a0a 100%)`,
        }}
      >
        {/* Header mejorado con logo */}
        <div className="w-full p-4 md:p-6 pb-5 border-b border-white/10 flex-shrink-0 backdrop-blur-sm bg-white/5">
          <div className="flex flex-col items-center gap-3">
            {/* Logo de la empresa */}
            {logoEmpresa && (
              <div className="relative group">
                <div className="w-16 h-16 md:w-20 md:h-20 rounded-xl overflow-hidden bg-white p-2 shadow-xl ring-2 ring-white/20 transition-all duration-300 group-hover:ring-white/40 group-hover:scale-105">
                  <img 
                    src={logoEmpresa} 
                    alt={nombreEmpresa || 'Logo'} 
                    className="w-full h-full object-contain transition-transform duration-300"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                </div>
              </div>
            )}
            
            {/* Nombre de la empresa */}
            {nombreEmpresa && (
              <div className="text-center">
                <h1 className="text-base md:text-lg lg:text-xl font-bold text-white px-2 drop-shadow-lg">
                  <SplitText
                    key={nombreEmpresa}
                    text={nombreEmpresa}
                    tag="span"
                    splitType="chars"
                    delay={75}
                  />
                </h1>
              </div>
            )}
          </div>
        </div>
        
        {/* Avatar del Trabajador con mejor diseño */}
        <div className="flex-shrink-0 px-4 pt-5 pb-3">
          <div className="bg-white/5 rounded-xl p-3 border border-white/10 backdrop-blur-sm">
            <AdminTrabajador />
          </div>
        </div>
        
        {/* Separador decorativo */}
        <div className="w-full px-4 my-3">
          <div className="h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
        </div>
        
        {/* Menú con scroll si es necesario */}
        <nav className="flex flex-col w-full gap-2 px-3 md:px-4 flex-1 justify-start overflow-y-auto custom-scrollbar">
          <SidebarItem
            icon={<HomeIcon />}
            label="INICIO"
            active={active === 'INICIO'}
            onClick={() => setActive('INICIO')}
            colorBotones={colorBotones}
          />
          <SidebarItem
            icon={<AccountCircleIcon />}
            label="CLIENTES"
            active={active === 'CLIENTES'}
            onClick={() => setActive('CLIENTES')}
            colorBotones={colorBotones}
          />
        </nav>
        
        {/* Separador decorativo antes del logout */}
        <div className="w-full px-4 my-3">
          <div className="h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
        </div>
        
        {/* Botón de logout mejorado */}
        <div className="flex-shrink-0 px-3 md:px-4 pb-4">
          <button
            onClick={handleLogout}
            className="group w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold text-white bg-white/5 hover:bg-red-500/20 transition-all duration-300 border border-white/20 hover:border-red-400/40 hover:shadow-lg hover:shadow-red-500/20 hover:scale-[1.02] backdrop-blur-sm"
            aria-label="Cerrar sesión"
          >
            <ExitToAppIcon className="transition-transform duration-300 group-hover:rotate-12" />
            <span className="text-sm md:text-base">Cerrar Sesión</span>
          </button>
        </div>
      </aside>
    </div>
  );
};

const SidebarItem = ({ icon, label, active, onClick, colorBotones = '#D72838' }) => {
  return (
    <button
      onClick={onClick}
      className={`
        group relative w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-300
        ${active 
          ? 'shadow-xl shadow-black/20 transform scale-[1.02]' 
          : 'hover:bg-white/5 hover:translate-x-1'
        }
      `}
      style={{
        backgroundColor: active ? `var(--color-botones, ${colorBotones})` : 'transparent',
        color: active ? '#fff' : 'rgba(255,255,255,0.8)',
        borderLeft: active ? `4px solid ${colorBotones}` : '4px solid transparent',
      }}
    >
      {/* Efecto de brillo en hover */}
      {!active && (
        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      )}
      
      <span 
        className="text-xl md:text-2xl transition-transform duration-300 group-hover:scale-110 z-10" 
        style={{ color: active ? '#fff' : 'rgba(255,255,255,0.7)' }}
      >
        {icon}
      </span>
      <span className="text-sm md:text-base flex-1 text-left z-10 font-semibold">{label}</span>
      {active && (
        <div 
          className="w-2 h-2 rounded-full animate-pulse z-10"
          style={{ backgroundColor: '#fff', boxShadow: '0 0 8px rgba(255,255,255,0.8)' }}
        ></div>
      )}
    </button>
  );
};

export default BarralateralTrabajador;
