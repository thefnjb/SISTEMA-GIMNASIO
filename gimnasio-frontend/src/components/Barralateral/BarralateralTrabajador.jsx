import React from 'react';
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

const BarralateralTrabajador = ({ active, setActive }) => {
  const navigate = useNavigate();

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
          background: 'linear-gradient(to bottom, #D72838 0%, #2E2E2E 40%, #1B1B1B 80%, #000 100%)', 
        }}
      >
        <div className="w-full mb-2 xs:mb-3 sm:mb-6 md:mb-8 text-center">
          <h1 className="mb-1 xs:mb-2 text-base xs:text-lg sm:text-xl md:text-2xl lg:text-3xl font-extrabold tracking-wide text-white px-2">
            <SplitText
              text="Gimnasio Terrones"
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
          />
          <SidebarItem
            icon={<AccountCircleIcon />}
            label="CLIENTES"
            active={active === 'CLIENTES'}
            onClick={() => setActive('CLIENTES')}
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


const SidebarItem = ({ icon, label, active, onClick }) => (
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
            backgroundColor: active ? '#D72838' : 'rgba(255,255,255,0.1)',
            color: active ? '#fff' : '#f5f5f5',
            '&:hover': {
              backgroundColor: active ? '#b71c1c' : 'rgba(255,255,255,0.2)',
            },
          }}
        >
          {label}
        </Button>
      </ClickSpark>
    </div>
  </Grow>
);

export default BarralateralTrabajador;
