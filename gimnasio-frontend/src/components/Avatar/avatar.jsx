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
};

const Admin = () => {

  return (
    <div className="flex flex-col items-center justify-center w-full px-2 py-2 rounded-xl">
      {/* Solo el texto ADMIN */}
      <div className="flex flex-col items-center justify-center gap-2">
        <span className="flex items-center gap-2 text-base md:text-lg font-semibold text-white">
          <AdminPanelSettingsIcon sx={{ fontSize: 24 }} />
          <ShinyText 
            text="ADMIN" 
            disabled={false} 
            speed={4} 
            className='custom-class' 
          />
        </span>
      </div>
    </div>
  );
};

const AdminTrabajador = () => {
  return (
    <div className="flex flex-col items-center justify-center w-full px-2 py-2 rounded-xl">
      {/* Solo el texto TRABAJADOR */}
      <div className="flex flex-col items-center justify-center gap-2">
        <span className="flex items-center gap-2 text-base md:text-lg font-semibold text-white">
          <AdminPanelSettingsIcon sx={{ fontSize: 24 }} />
          <ShinyText 
            text="TRABAJADOR" 
            disabled={false} 
            speed={3} 
            className='custom-class' 
          />
        </span>
      </div>
    </div>
  );
};

export default AvatarGroup;
export { Admin, AdminTrabajador };
