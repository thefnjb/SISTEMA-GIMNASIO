import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminTrabajador } from '../Avatar/avatar';
import HomeIcon from '@mui/icons-material/Home';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import Grow from '@mui/material/Grow';
import SplitText from '../TextAnimation/SplitText';
import ClickSpark from '../ClickSpark/ClickSpark';
import api from '../../utils/axiosInstance';

const BarralateralTrabajador = ({ active, setActive }) => {
  const navigate = useNavigate();
  const [nombreEmpresa, setNombreEmpresa] = useState("");
  const [colorSistema, setColorSistema] = useState("#D72838");
  const [colorBotones, setColorBotones] = useState("#D72838");

  useEffect(() => {
    // Obtener datos de la empresa al montar el componente
    const obtenerDatosEmpresa = async () => {
      try {
        const response = await api.get('/gym/datos-empresa');
        console.log('Datos de empresa recibidos (BarralateralTrabajador):', response.data);
        if (response.data.success && response.data.empresa) {
          if (response.data.empresa.nombreEmpresa) {
            setNombreEmpresa(response.data.empresa.nombreEmpresa);
            console.log('Nombre de empresa establecido (BarralateralTrabajador):', response.data.empresa.nombreEmpresa);
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
        // Si hay error, mantener el nombre por defecto
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

    const handleDatosEmpresaActualizados = async () => {
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
    <div className="flex">
      <aside
        className="flex flex-col items-center min-h-screen p-2 xs:p-3 sm:p-4 md:p-6 text-white shadow-2xl w-full md:w-72"
        style={{
          background: `linear-gradient(to bottom, var(--color-sistema, ${colorSistema}) 0%, #2E2E2E 40%, #1B1B1B 80%, #000 100%)`, 
        }}
      >
        <div className="w-full mb-2 xs:mb-3 sm:mb-6 md:mb-8 text-center flex-shrink-0">
          <h1 className="mb-1 xs:mb-2 text-base xs:text-lg sm:text-xl md:text-2xl lg:text-3xl font-extrabold tracking-wide text-white px-2">
            <SplitText
              text={nombreEmpresa || "Gimnasio"}
              tag="span"
              splitType="chars"
              delay={75}
            />
          </h1>
        </div>
        <div className="scale-75 xs:scale-90 sm:scale-100">
          <AdminTrabajador />
        </div>
        <nav className="flex flex-col flex-1 w-full gap-1.5 xs:gap-2 sm:gap-3 md:gap-4 mt-2 xs:mt-3 sm:mt-6 md:mt-8 px-1 xs:px-2">
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
        <div className="flex justify-end w-full mt-auto">
          <IconButton onClick={handleLogout} color="inherit" aria-label="salir">
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
            sx={{
              justifyContent: 'flex-start',
              fontWeight: active ? 'bold' : 'normal',
              fontSize: { xs: '0.9rem', sm: '1rem', md: '1.1rem' },
              my: 1,
              borderRadius: 2,
              textTransform: 'none',
              backgroundColor: active ? 'var(--color-botones, ' + colorBotones + ')' : 'rgba(255,255,255,0.1)',
              color: active ? '#fff' : '#f5f5f5',
              '&:hover': {
                backgroundColor: active ? 'var(--color-botones, ' + colorBotones + ')' : 'rgba(255,255,255,0.2)',
                opacity: active ? 0.9 : 1,
              },
            }}
          >
            {label}
          </Button>
        </ClickSpark>
      </div>
    </Grow>
  );
};

export default BarralateralTrabajador;
