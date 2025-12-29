import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Admin } from '../Avatar/avatar';
import HomeIcon from '@mui/icons-material/Home';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import AddchartIcon from '@mui/icons-material/Addchart';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import EngineeringOutlinedIcon from '@mui/icons-material/EngineeringOutlined';
import SettingsIcon from '@mui/icons-material/Settings';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import Grow from '@mui/material/Grow';
import SplitText from '../TextAnimation/SplitText';
import ClickSpark from '../ClickSpark/ClickSpark';
import api from '../../utils/axiosInstance';

const Barralateral = ({ active, setActive }) => {
  const navigate = useNavigate();
  const [nombreEmpresa, setNombreEmpresa] = useState("");
  const [colorSistema, setColorSistema] = useState("#D72838");
  const [colorBotones, setColorBotones] = useState("#D72838");
  const [ultimaConfiguracion, setUltimaConfiguracion] = useState(false);

  const obtenerDatosEmpresa = async () => {
    try {
      const response = await api.get('/gym/datos-empresa');
      console.log('Datos de empresa recibidos (Barralateral):', response.data);
      if (response.data.success && response.data.empresa) {
        // Establecer nombre de empresa siempre que exista
        const nombre = response.data.empresa.nombreEmpresa;
        if (nombre && nombre.trim()) {
          setNombreEmpresa(nombre.trim());
          console.log('Nombre de empresa establecido (Barralateral):', nombre.trim());
        }
        if (response.data.empresa.colorSistema) {
          setColorSistema(response.data.empresa.colorSistema);
        }
        if (response.data.empresa.colorBotones) {
          setColorBotones(response.data.empresa.colorBotones);
        }
      }
    } catch (error) {
      console.error('Error al obtener datos de la empresa:', error);
    }
  };

  useEffect(() => {
    // Obtener datos de la empresa al montar el componente
    obtenerDatosEmpresa();
  }, []);

  // Recargar datos cuando se sale de CONFIGURACIÓN
  useEffect(() => {
    if (ultimaConfiguracion && active !== 'CONFIGURACIÓN') {
      // Se salió de CONFIGURACIÓN, recargar datos
      obtenerDatosEmpresa();
      setUltimaConfiguracion(false);
    } else if (active === 'CONFIGURACIÓN') {
      setUltimaConfiguracion(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

  // Escuchar cambios en los colores del sistema y datos de la empresa
  useEffect(() => {
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
        className="flex flex-col items-center h-full min-h-screen p-2 xs:p-3 sm:p-4 md:p-6 text-white shadow-2xl w-full max-w-full md:max-w-72 overflow-y-auto overflow-x-hidden custom-scrollbar"
        style={{
          background: `linear-gradient(to bottom, var(--color-sistema, ${colorSistema}) 0%, #2E2E2E 40%, #1B1B1B 80%, #000 100%)`,
        }}
      >
        {/* Header fijo */}
        <div className="w-full mb-2 xs:mb-3 sm:mb-6 md:mb-8 text-center flex-shrink-0">
          <h1 className="mb-1 xs:mb-2 text-base xs:text-lg sm:text-xl md:text-2xl lg:text-3xl font-extrabold tracking-wide text-white px-2">
            {nombreEmpresa ? (
              <SplitText
                key={nombreEmpresa}
                text={nombreEmpresa}
                tag="span"
                splitType="chars"
                delay={75}
              />
            ) : (
              <span className="animate-pulse">Cargando...</span>
            )}
          </h1>
        </div>
        
        {/* Avatar fijo - tamaño mejorado */}
        <div className="flex-shrink-0 mb-2 xs:mb-3">
          <Admin />
        </div>
        
        {/* Menú con scroll si es necesario */}
        <nav className="flex flex-col w-full gap-0.5 xs:gap-1 sm:gap-1.5 mt-1 xs:mt-2 sm:mt-3 px-1 xs:px-2 flex-1 justify-start overflow-y-auto custom-scrollbar">
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
          <SidebarItem
            icon={<EngineeringOutlinedIcon />}
            label="TRABAJADORES"
            active={active === 'TRABAJADORES'}
            onClick={() => setActive('TRABAJADORES')}
            colorBotones={colorBotones}
          />
          <SidebarItem
            icon={<AddchartIcon />}
            label="INGRESOS"
            active={active === 'INGRESOS'}
            onClick={() => setActive('INGRESOS')}
            colorBotones={colorBotones}
          />
          <SidebarItem
            icon={<SettingsIcon />}
            label="CONFIGURACIÓN"
            active={active === 'CONFIGURACIÓN'}
            onClick={() => setActive('CONFIGURACIÓN')}
            colorBotones={colorBotones}
          />
        </nav>
        
        {/* Botón de logout fijo en la parte inferior */}
        <div className="flex justify-end w-full mt-2 xs:mt-3 flex-shrink-0 pb-2">
          <IconButton onClick={handleLogout} color="inherit" aria-label="salir" sx={{ color: 'white' }}>
            <ExitToAppIcon fontSize="large" />
          </IconButton>
        </div>
      </aside>
    </div>
  );
};

const SidebarItem = ({ icon, label, active, onClick, colorBotones = '#D72838' }) => {
  return (
    <Grow in={true} timeout={600}>
      <div>
        <ClickSpark>
          <Button
            onClick={onClick}
            startIcon={icon}
            variant="contained"
            color="default"
            fullWidth
            size="small"
            sx={{
              justifyContent: 'flex-start',
              fontWeight: active ? 'bold' : 'normal',
              fontSize: { xs: '0.85rem', sm: '0.9rem', md: '0.95rem' },
              py: 1,
              my: 0.5,
              minHeight: '44px',
              borderRadius: 1.5,
              textTransform: 'none',
              backgroundColor: active ? 'var(--color-botones, ' + colorBotones + ')' : 'rgba(255,255,255,0.1)',
              color: active ? '#fff' : '#f5f5f5',
              '&:hover': {
                backgroundColor: active ? 'var(--color-botones, ' + colorBotones + ')' : 'rgba(255,255,255,0.2)',
                opacity: active ? 0.9 : 1,
              },
              '& .MuiButton-startIcon': {
                marginRight: '10px',
                '& > *:nth-of-type(1)': {
                  fontSize: '1.2rem'
                }
              }
            }}
          >
            {label}
          </Button>
        </ClickSpark>
      </div>
    </Grow>
  );
};

export default Barralateral;
