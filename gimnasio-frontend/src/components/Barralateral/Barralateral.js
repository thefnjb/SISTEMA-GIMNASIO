import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Admin } from '../Avatar/avatar';
import HomeIcon from '@mui/icons-material/Home';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import AddchartIcon from '@mui/icons-material/Addchart';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import Grow from '@mui/material/Grow';

const Barralateral = ({ active, setActive }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('userToken');
    navigate('/');
  };

  return (
    <div className="flex">
      <aside className="fixed top-0 left-0 flex flex-col items-center min-h-screen p-6 text-white shadow-2xl w-72 bg-gradient-to-b from-black via-gray-900 to-gray-800">
        <div className="w-full mb-8 text-center">
          <h1 className="mb-2 text-3xl font-extrabold tracking-wide">Gimnasio Terrones</h1>
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
          textTransform: 'none'
        }}
      >
        {label}
      </Button>
    </div>
  </Grow>
);

export default Barralateral;