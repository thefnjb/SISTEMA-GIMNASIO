import React, { useState, useEffect } from 'react';
import { User } from "@heroui/react";
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import ShinyText from './ShinyText';
import api from '../../utils/axiosInstance';

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
  const [logoEmpresa, setLogoEmpresa] = useState("/images/logo.ico");
  const [nombreEmpresa, setNombreEmpresa] = useState("");

  useEffect(() => {
    // Obtener datos de la empresa al montar el componente
    const obtenerDatosEmpresa = async () => {
      try {
        const response = await api.get('/gym/datos-empresa');
        console.log('Datos de empresa recibidos (Admin):', response.data);
        if (response.data.success && response.data.empresa) {
          if (response.data.empresa.logoEmpresa) {
            // Asegurarse de que el logo sea una cadena válida
            const logo = response.data.empresa.logoEmpresa;
            if (typeof logo === 'string' && logo.length > 0) {
              setLogoEmpresa(logo);
            }
          }
          if (response.data.empresa.nombreEmpresa) {
            setNombreEmpresa(response.data.empresa.nombreEmpresa);
            console.log('Nombre de empresa establecido (Admin):', response.data.empresa.nombreEmpresa);
          }
        }
      } catch (error) {
        console.error('Error al obtener datos de la empresa:', error);
        // Si hay error, mantener el logo por defecto
      }
    };

    obtenerDatosEmpresa();

    // Escuchar cambios en los datos de la empresa
    const handleDatosEmpresaActualizados = async () => {
      await obtenerDatosEmpresa();
    };

    window.addEventListener('datosEmpresaActualizados', handleDatosEmpresaActualizados);

    return () => {
      window.removeEventListener('datosEmpresaActualizados', handleDatosEmpresaActualizados);
    };
  }, []);

  return (
    <div className="flex items-center justify-center w-full px-2 py-2 rounded-xl">
      <User
        avatarProps={{
          src: logoEmpresa,
          className: "w-20 h-20 xs:w-24 xs:h-24 sm:w-28 sm:h-28",
          isBordered: true,
          fallback: "/images/logo.ico"
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
            {nombreEmpresa || "Administrador"}
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
};

const AdminTrabajador = () => {
  const [logoEmpresa, setLogoEmpresa] = useState("/images/logo.ico");
  const [nombreEmpresa, setNombreEmpresa] = useState("");

  useEffect(() => {
    // Obtener datos de la empresa al montar el componente
    const obtenerDatosEmpresa = async () => {
      try {
        const response = await api.get('/gym/datos-empresa');
        console.log('Datos de empresa recibidos (Trabajador):', response.data);
        if (response.data.success && response.data.empresa) {
          if (response.data.empresa.logoEmpresa) {
            // Asegurarse de que el logo sea una cadena válida
            const logo = response.data.empresa.logoEmpresa;
            if (typeof logo === 'string' && logo.length > 0) {
              setLogoEmpresa(logo);
            }
          }
          if (response.data.empresa.nombreEmpresa) {
            setNombreEmpresa(response.data.empresa.nombreEmpresa);
            console.log('Nombre de empresa establecido (Trabajador):', response.data.empresa.nombreEmpresa);
          }
        }
      } catch (error) {
        console.error('Error al obtener datos de la empresa:', error);
        // Si hay error, mantener el logo por defecto
      }
    };

    obtenerDatosEmpresa();

    // Escuchar cambios en los datos de la empresa
    const handleDatosEmpresaActualizados = async () => {
      await obtenerDatosEmpresa();
    };

    window.addEventListener('datosEmpresaActualizados', handleDatosEmpresaActualizados);

    return () => {
      window.removeEventListener('datosEmpresaActualizados', handleDatosEmpresaActualizados);
    };
  }, []);

  return (
    <div className="flex items-center justify-start w-full px-4 py-3 rounded-xl">
      <User
        avatarProps={{
          src: logoEmpresa,
          className: "w-14 h-14",
          isBordered: false,
          fallback: "/images/logo.ico"
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
            {nombreEmpresa || "Empleado"}
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
};

export default AvatarGroup;
export { Admin, AdminTrabajador };
