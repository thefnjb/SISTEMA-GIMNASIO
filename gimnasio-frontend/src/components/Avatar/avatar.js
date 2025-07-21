import React from 'react';
const AvatarGroup = () => {
  return (
    <div className="flex justify-center gap-2 mb-4">
      <img className="w-20 h-20 rounded-full border-2 border-white" src="/images/logo.jpg" alt="logo" />
    </div>
  );
}
const Admin = () =>{
  return (
      <div className="w-[100px] h-[100px] rounded-lg ">
        <img className="w-20 h-20 rounded-full border-2 border-white " src="/images/logo.jpg" alt="logo" />
      </div>
  );
}

export default AvatarGroup;
export { Admin };
