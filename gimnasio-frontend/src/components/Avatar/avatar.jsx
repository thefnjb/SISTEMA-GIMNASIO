import React from 'react';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import ShinyText from './ShinyText';
const AvatarGroup = () => {
  return (
    <div className="flex justify-center gap-2 mb-4">
      <img className="w-20 h-20 border-2 border-white rounded-full" src="/images/logo.ico" alt="logo" />
    </div>
  );
}
const Admin = () =>{
  return (
   <div className="flex  flex-col items-center justify-center  min-h-[200px]  rounded-xl p-4 shadow-sm">
      <div className="w-[100px] h-[100px] rounded-lg  overflow-hidden mb-4">
        <img 
          className="object-cover w-full h-full border-white rounded-full border-1" 
          src="/images/logo.ico" 
          alt="logo"
        />
      </div>
      <span className="flex items-center gap-2 text-base font-medium text-white">
        <AdminPanelSettingsIcon sx={{ fontSize: 25 }} />
        <ShinyText 
          text="ADMIN" 
          disabled={false} 
          speed={4} 
          className='custom-class' 
          />
      </span>
    </div>
  );
}

const AdminTrabajador = () =>{
  return (
   <div className="flex  flex-col items-center justify-center  min-h-[200px]  rounded-xl p-4 shadow-sm">
      <div className="w-[100px] h-[100px] rounded-lg  overflow-hidden mb-4">
        <img 
          className="object-cover w-full h-full border-white rounded-full border-1" 
          src="/images/logo.ico" 
          alt="logo"
        />
      </div>
      <span className="flex items-center gap-2 text-base font-medium text-white">
        <AdminPanelSettingsIcon sx={{ fontSize: 25 }} />
        <ShinyText 
          text="TRABAJADOR" 
          disabled={false} 
          speed={3} 
          className='custom-class' 
          />
      </span>
    </div>
  );
}
export default AvatarGroup;
export { Admin };
export { AdminTrabajador };
