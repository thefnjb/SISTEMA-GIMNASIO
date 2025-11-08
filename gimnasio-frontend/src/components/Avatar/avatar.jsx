import React from 'react';
import { User } from "@heroui/react";
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import ShinyText from './ShinyText';

const AvatarGroup = () => {
  return (
    <div className="flex justify-center gap-2 mb-4">
      <User
        avatarProps={{
          src: "/images/logo.ico",
          className: "w-20 h-20",
          isBordered: false,
        }}
        classNames={{
          base: "justify-center",
        }}
      />
    </div>
  );
}

const Admin = () => {
  return (
    <div className="flex items-center justify-start w-full px-4 py-3 rounded-xl">
      <User
        avatarProps={{
          src: "/images/logo.ico",
          className: "w-14 h-14",
          isBordered: false,
        }}
        name={
          <span className="flex items-center gap-2 text-base font-medium text-white">
            <AdminPanelSettingsIcon sx={{ fontSize: 22 }} />
            <ShinyText 
              text="ADMIN" 
              disabled={false} 
              speed={4} 
              className='custom-class' 
            />
          </span>
        }
        description={
          <span className="text-sm text-gray-400">
            Administrador
          </span>
        }
        classNames={{
          base: "gap-3 bg-transparent",
          wrapper: "gap-1",
          name: "text-white font-semibold",
          description: "text-gray-400"
        }}
      />
    </div>
  );
}

const AdminTrabajador = () => {
  return (
    <div className="flex items-center justify-start w-full px-4 py-3 rounded-xl">
      <User
        avatarProps={{
          src: "/images/logo.ico",
          className: "w-14 h-14",
          isBordered: false,
        }}
        name={
          <span className="flex items-center gap-2 text-base font-medium text-white">
            <AdminPanelSettingsIcon sx={{ fontSize: 22 }} />
            <ShinyText 
              text="TRABAJADOR" 
              disabled={false} 
              speed={3} 
              className='custom-class' 
            />
          </span>
        }
        description={
          <span className="text-sm text-gray-400">
            Empleado
          </span>
        }
        classNames={{
          base: "gap-3 bg-transparent",
          wrapper: "gap-1",
          name: "text-white font-semibold",
          description: "text-gray-400"
        }}
      />
    </div>
  );
}

export default AvatarGroup;
export { Admin, AdminTrabajador };