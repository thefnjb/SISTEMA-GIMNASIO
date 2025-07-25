import React from 'react';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
const AvatarGroup = () => {
  return (
    <div className="flex justify-center gap-2 mb-4">
      <img className="w-20 h-20 rounded-full border-2 border-white" src="/images/logo.jpg" alt="logo" />
    </div>
  );
}
const Admin = () =>{
  return (
   <div className="flex  flex-col items-center justify-center  min-h-[200px]  rounded-xl p-4 shadow-sm">
      <div className="w-[100px] h-[100px] rounded-lg  overflow-hidden mb-4">
        <img 
          className="w-full h-full object-cover rounded-full border-2 border-white" 
          src="/images/logo.jpg" 
          alt="logo"
        />
      </div>
      <span className="flex items-center gap-2 text-base font-medium text-white">
        <AdminPanelSettingsIcon sx={{ fontSize: 25 }} />
        Nombre Admin
      </span>
    </div>
  );
}

export default AvatarGroup;
export { Admin };
