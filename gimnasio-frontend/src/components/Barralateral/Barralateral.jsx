import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Admin } from '../Avatar/avatar';
import HomeIcon from '@mui/icons-material/Home';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import AddchartIcon from '@mui/icons-material/Addchart';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import EngineeringOutlinedIcon from '@mui/icons-material/EngineeringOutlined';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import Grow from '@mui/material/Grow';
import TextType from '../TextAnimation/TextType';
import ClickSpark from '../ClickSpark/ClickSpark';

const Barralateral = ({ active, setActive }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('rol');
    navigate('/');
  };

  return (
    <div className="flex">
      <aside
        className="fixed top-0 left-0 flex flex-col items-center min-h-screen p-6 text-white shadow-2xl w-72"
        style={{
          background: 'linear-gradient(to bottom, #D72838 0%, #2E2E2E 40%, #1B1B1B 80%, #000 100%)', 
        }}
      >
        <div className="w-full mb-8 text-center">
          <h1 className="mb-2 text-3xl font-extrabold tracking-wide text-white">
            <TextType 
              text={["Gimnasio Terrones"]}
              typingSpeed={75}
              pauseDuration={5000}
              showCursor={true}
              cursorCharacter="|"
            />
          </h1>
        </div>
        <Admin />
        <nav className="flex flex-col flex-1 w-full gap-4 mt-8">
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
          <SidebarItem
            icon={<EngineeringOutlinedIcon />}
            label="TRABAJADORES"
            active={active === 'TRABAJADORES'}
            onClick={() => setActive('TRABAJADORES')}
          />
          <SidebarItem
            icon={<AddchartIcon />}
            label="INGRESOS"
            active={active === 'INGRESOS'}
            onClick={() => setActive('INGRESOS')}
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
            fontSize: '1.1rem',
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

export default Barralateral;
