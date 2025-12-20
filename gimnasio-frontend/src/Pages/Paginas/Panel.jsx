import React, { useState } from "react";
import Barralateral from "../../components/Barralateral/Barralateral";
import { CustomCard } from "../../components/Card/spacer";
import { CustomCardMobile } from "../../components/Card/CustomCardMobile";
import Ingresos from "./Ingresos";
import IncribirTrabajador from "../../components/Trabajadores/incribirTrabajador";
import TablaClientesAdmin from "../../components/Tabla/TablaCldia/TablaClientesAdmin";
import ModalSuscripcion from "../../components/Modal/ModalSuscripcion";
import ModalDia from "../../components/Modal/ModalDia";
import ModalEntrenadores from "../../components/Modal/ModalEntrenadores";
import Membresia from "../../components/Membresia/Membresia";
import ModalviewMembresia from "../../components/Membresia/ModalviewMembresia";
import ModalVerEntrenadores from "../../components/Modal/ModalVerEntrenadores";
import ConfiguracionEmpresa from "../../components/Configuracion/ConfiguracionEmpresa";
import { Button } from "@heroui/react";
import TablaClientesDia from "../../components/Tabla/TablaCldia/ClientesPorDia";
import RemoveRedEyeRoundedIcon from '@mui/icons-material/RemoveRedEyeRounded';
import AddCircleOutlineRoundedIcon from '@mui/icons-material/AddCircleOutlineRounded';
import GetAppRoundedIcon from '@mui/icons-material/GetAppRounded';
import { useColoresSistema } from '../../hooks/useColoresSistema';
import SkeletonLoader from '../../components/Skeleton/SkeletonLoader';

function Panel() {
  const coloresCargados = useColoresSistema();
  const [active, setActive] = useState("INICIO");
  const [showAgregar, setShowAgregar] = useState(false);
  const [showVer, setShowVer] = useState(false);
  const [refreshClientes, setRefreshClientes] = useState(0);
  const [refreshEntrenadores, setRefreshEntrenadores] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false); 

  const handleClienteAgregado = () => {
    setRefreshClientes((prev) => prev + 1);
  };

  const handleEntrenadorAgregado = () => {
    setRefreshEntrenadores((prev) => !prev);
  };

  const renderContent = () => {
    switch (active) {
      case "INICIO":
        return (
          <div className="p-2 xs:p-3 sm:p-4 md:p-6">
            <div className="flex justify-end mb-3 xs:mb-4 sm:mb-6">
              <Button
                className="flex items-center gap-1.5 xs:gap-2 sm:gap-3 px-2 xs:px-3 sm:px-4 py-1.5 xs:py-2 text-xs xs:text-sm sm:text-base font-bold text-white bg-color-botones rounded shadow"
              >
                <span
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowAgregar(true);
                  }}
                  className="text-base xs:text-lg sm:text-xl cursor-pointer"
                  title="Agregar membresía"
                >
                  <AddCircleOutlineRoundedIcon fontSize="inherit" />
                </span>
                <span
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowVer(true);
                  }}
                  className="text-base xs:text-lg sm:text-xl cursor-pointer"
                  title="Ver membresías"
                >
                  <RemoveRedEyeRoundedIcon fontSize="inherit" />
                </span>
                <span className="hidden xs:inline sm:hidden">MEMB.</span>
                <span className="hidden sm:inline">MEMBRESÍAS</span>
              </Button>
            </div>

            {/* Cards para móvil/tablet */}
            <div className="flex flex-col gap-4 md:hidden">
              <CustomCardMobile title="Membresías" description="Inscribir clientes por membresías - Clientes que se inscriben con una suscripción">
                <ModalSuscripcion
                  triggerText={<GetAppRoundedIcon fontSize="large" />}
                  onSuscripcionExitosa={handleClienteAgregado}
                />
              </CustomCardMobile>

              <CustomCardMobile title="Clientes por Día" description="Registra clientes que entrenan por día">
                <ModalDia
                  triggerText={<GetAppRoundedIcon fontSize="large" />}
                  title="Clientes por Dia"
                  onClienteAgregado={handleClienteAgregado}
                />
              </CustomCardMobile>

              <CustomCardMobile title="Entrenadores" description="Administra los entrenadores del gimnasio">
                <div className="flex gap-4">
                  <ModalEntrenadores
                    triggerText={<GetAppRoundedIcon fontSize="large" />}
                    title="Entrenadores"
                    onEntrenadorAgregado={handleEntrenadorAgregado}
                  />
                  <ModalVerEntrenadores
                    triggerText={<RemoveRedEyeRoundedIcon fontSize="large" />}
                    title="Entrenadores"
                    refresh={refreshEntrenadores}
                  />
                </div>
              </CustomCardMobile>
            </div>

            {/* Cards para desktop */}
            <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <CustomCard title="Membresías" description="Inscribir clientes por membresías - Clientes que se inscriben con una suscripción">
                <ModalSuscripcion
                  triggerText={<GetAppRoundedIcon fontSize="large" />}
                  onSuscripcionExitosa={handleClienteAgregado}
                />
              </CustomCard>

              <CustomCard title="Clientes por Día" description="Registra clientes que entrenan por día">
                <div className="flex gap-10">
                  <ModalDia
                    triggerText={<GetAppRoundedIcon fontSize="large" />}
                    title="Clientes por Dia"
                    onClienteAgregado={handleClienteAgregado}
                  />
                </div>
              </CustomCard>

              <CustomCard title="Entrenadores" description="Administra los entrenadores del gimnasio">
                <div className="flex gap-10">
                  <ModalEntrenadores
                    triggerText={<GetAppRoundedIcon fontSize="large" />}
                    title="Entrenadores"
                    onEntrenadorAgregado={handleEntrenadorAgregado}
                  />
                  <ModalVerEntrenadores
                    triggerText={<RemoveRedEyeRoundedIcon fontSize="large" />}
                    title="Entrenadores"
                    refresh={refreshEntrenadores}
                  />
                </div>
              </CustomCard>
            </div>

            <div className="mt-4 sm:mt-6 md:mt-8 lg:mt-10 xl:mt-12">
              <TablaClientesDia refresh={refreshClientes} />

              {showAgregar && (
                <Membresia onClose={() => setShowAgregar(false)} />
              )}

              {showVer && (
                <ModalviewMembresia onClose={() => setShowVer(false)} />
              )}
            </div>
          </div>
        );

      case "INGRESOS":
        return <Ingresos />;

      case "TRABAJADORES":
        return <IncribirTrabajador />;

      case "CLIENTES":
        return (
          <div className="w-full p-2 xs:p-3 sm:p-4 md:p-6 overflow-x-auto">
            <TablaClientesAdmin refresh={refreshClientes} />
          </div>
        );

      case "CONFIGURACIÓN":
        return <ConfiguracionEmpresa />;

      default:
        return null;
    }
  };

  // Mostrar skeleton mientras se cargan los colores
  if (!coloresCargados) {
    return <SkeletonLoader />;
  }

  return (
    <div className="relative w-full min-h-screen bg-white">
      {/* Grid Background */}
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: `
        linear-gradient(to right, #e5e7eb 1px, transparent 1px),
        linear-gradient(to bottom, #e5e7eb 1px, transparent 1px)
      `,
          backgroundSize: "40px 40px",
        }}
      />

      <div className="relative z-10 flex h-screen overflow-hidden">
        {/* Static sidebar for desktop */}
        <div className="hidden md:flex md:flex-shrink-0">
          <div className="flex flex-col w-72">
            <Barralateral active={active} setActive={setActive} />
          </div>
        </div>

        {/* Mobile sidebar overlay */}
        {sidebarOpen && (
          <div className="md:hidden" role="dialog" aria-modal="true">
            <div className="fixed inset-0 z-40 flex">
              <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)}></div>
              <div className="relative flex flex-col flex-1 w-full max-w-[280px] xs:max-w-xs bg-white">
                <div className="absolute top-0 right-0 pt-1 xs:pt-2 -mr-10 xs:-mr-12">
                  <button
                    type="button"
                    className="flex items-center justify-center w-8 h-8 xs:w-10 xs:h-10 ml-1 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-black"
                    onClick={() => setSidebarOpen(false)}
                  >
                    <span className="sr-only">Close sidebar</span>
                    <svg className="w-5 h-5 xs:w-6 xs:h-6 text-black" stroke="currentColor" fill="none" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <div onClick={() => setSidebarOpen(false)}>
                  <Barralateral active={active} setActive={setActive} />
                </div>
              </div>
              <div className="flex-shrink-0 w-10 xs:w-14"></div>
            </div>
          </div>
        )}

        {/* Main content */}
        <div className="flex flex-col flex-1 w-0 overflow-hidden">
          {/* Mobile header with hamburger button */}
          <div className="flex items-center pt-2 xs:pt-3 pl-2 xs:pl-3 md:hidden">
            <button
              type="button"
              className="-ml-0.5 -mt-0.5 h-10 w-10 xs:h-12 xs:w-12 inline-flex items-center justify-center rounded-md text-gray-500 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
              onClick={() => setSidebarOpen(true)}
            >
              <span className="sr-only">Open sidebar</span>
              <svg className="w-5 h-5 xs:w-6 xs:h-6" stroke="currentColor" fill="none" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <h1 className="ml-2 xs:ml-4 text-base xs:text-lg sm:text-xl font-bold truncate">{active}</h1>
          </div>

          {/* Content area */}
          <div className="flex-1 overflow-y-auto">
            <div>
              {renderContent()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Panel;