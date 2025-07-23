import React from 'react';
import { Admin } from '../Avatar/avatar';
import HomeIcon from '@mui/icons-material/Home';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';

const Barralateral = ({ active, setActive }) => {
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
  <div
    onClick={onClick}
    className={`flex items-center gap-4 text-xl font-semibold px-4 py-3 rounded-lg cursor-pointer transition-all select-none
      ${active ? 'bg-gradient-to-r from-purple-500 via-blue-500 to-gray-400 text-white shadow-lg scale-105' : 'bg-slate-800 hover:bg-gradient-to-r from-purple-500 via-blue-500 to-gray-400 hover:text-white'}`}
  >
    <span className="text-2xl">{icon}</span>
    <span>{label}</span>
  </div>
);

export default Barralateral;
