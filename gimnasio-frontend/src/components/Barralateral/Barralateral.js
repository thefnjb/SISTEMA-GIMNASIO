
import React from 'react';
import { Admin } from '../Avatar/avatar';
import { useState } from 'react';
import HomeIcon from '@mui/icons-material/Home';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';

import Button from '@mui/material/Button';
import Grow from '@mui/material/Grow';

const Barralateral = () => {
  const [active, setActive] = useState('INICIO');
  return (
    <aside className="w-72 min-h-screen bg-gradient-to-b from-black via-gray-900 to-gray-800 text-white p-6 flex flex-col items-center shadow-2xl">
      <div className="mb-8 w-full text-center">
        <h1 className="text-3xl font-extrabold tracking-wide mb-2">Gimnasio Terrones</h1>
        <div className="flex flex-col items-center gap-2 mt-6">
          <Admin />
        </div>
      </div>
      <nav className="w-full flex-1 flex flex-col gap-4 mt-8">
        <SidebarItem icon={<HomeIcon />} label="INICIO" active={active === 'INICIO'} onClick={() => setActive('INICIO')} />
        <SidebarItem icon={<AccountCircleIcon />} label="CLIENTES" active={active === 'CLIENTES'} onClick={() => setActive('CLIENTES')} />
        <SidebarItem icon={<AccountBalanceWalletIcon />} label="INGRESOS" active={active === 'INGRESOS'} onClick={() => setActive('INGRESOS')} />
        <SidebarItem icon={<ExitToAppIcon />} label="SALIDA" active={active === 'SALIDA'} onClick={() => setActive('SALIDA')} />
      </nav>
    </aside>
  );
};
const SidebarItem = ({ icon, label, active, onClick }) => (
    <Grow in={true} timeout={600}>
    <div>
      <Button
        onClick={onClick}
        startIcon={icon}
        variant="outlined"
        color="inherit"
        fullWidth
        sx={{
          justifyContent: "flex-start",
          fontWeight: active ? "bold" : "normal",
          fontSize: "1.1rem",
          my: 1,
          borderRadius: 2,
          textTransform: "none"
        }}
      >
        {label}
      </Button>
    </div>
  </Grow>
);

export default Barralateral