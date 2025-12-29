import React, { useState } from "react";
import BarralateralTrabajador from "../../components/Barralateral/BarralateralTrabajador";
import { CustomCard } from "../../components/Card/spacer";
import { CustomCardMobile } from "../../components/Card/CustomCardMobile";
import TablaClientes from "../../components/Tabla/TablaCldia/TablaClientes";
import ModalSuscripcion from "../../components/Modal/ModalSuscripcion";
import ModalDia from "../../components/Modal/ModalDia";
import TablaClientesDiaTrabajador from "../../components/Tabla/TablaCldia/ClientesDiaTrabajador"; // ✅ Import corregido
import GetAppRoundedIcon from "@mui/icons-material/GetAppRounded";
import { useColoresSistema } from "../../hooks/useColoresSistema";
import SkeletonLoader from "../../components/Skeleton/SkeletonLoader";
import ModalInfoCard from "../../components/Modal/ModalInfoCard";

const PanelTrabajador = () => {
  const coloresCargados = useColoresSistema();
  const [active, setActive] = useState("INICIO");
  const [refreshClientes, setRefreshClientes] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [modalInfoMembresias, setModalInfoMembresias] = useState(false);
  const [modalInfoClientesDia, setModalInfoClientesDia] = useState(false);

  // 🔄 Refresca las tablas cuando se agrega un cliente o suscripción
  const handleClienteAgregado = () => {
    setRefreshClientes((prev) => prev + 1);
  };

  // 🔹 Renderiza el contenido según la opción activa del menú lateral
  const renderContent = () => {
    switch (active) {
      case "INICIO":
        return (
          <div className="p-2 xs:p-3 sm:p-4 md:p-6">
            {/* 🧩 Cards principales */}
            {/* Cards para móvil/tablet */}
            <div className="flex flex-col gap-3 xs:gap-4 md:hidden max-w-4xl mx-auto">
              <CustomCardMobile 
                title="Membresías" 
                onClick={() => setModalInfoMembresias(true)}
              >
                <ModalSuscripcion
                  triggerText={<GetAppRoundedIcon fontSize="large" />}
                  onSuscripcionExitosa={handleClienteAgregado}
                />
              </CustomCardMobile>

              <CustomCardMobile 
                title="Clientes por Día" 
                onClick={() => setModalInfoClientesDia(true)}
              >
                <ModalDia
                  triggerText={<GetAppRoundedIcon fontSize="large" />}
                  title="Clientes por Día"
                  onClienteAgregado={handleClienteAgregado}
                />
              </CustomCardMobile>
            </div>

            {/* Cards para desktop */}
            <div className="hidden md:grid md:grid-cols-2 gap-6 md:gap-8 max-w-4xl mx-auto">
              <CustomCard 
                title="Membresías" 
                className="w-full max-w-xs sm:max-w-sm mx-auto"
                onClick={() => setModalInfoMembresias(true)}
              >
                <ModalSuscripcion
                  triggerText={<GetAppRoundedIcon fontSize="large" />}
                  onSuscripcionExitosa={handleClienteAgregado}
                />
              </CustomCard>

              <CustomCard 
                title="Clientes por Día" 
                className="w-full max-w-xs sm:max-w-sm mx-auto"
                onClick={() => setModalInfoClientesDia(true)}
              >
                <div className="flex justify-center">
                  <ModalDia
                    triggerText={<GetAppRoundedIcon fontSize="large" />}
                    title="Clientes por Día"
                    onClienteAgregado={handleClienteAgregado}
                  />
                </div>
              </CustomCard>
            </div>

            {/* 🧾 Tabla de clientes debajo */}
            <div className="mt-3 xs:mt-4 sm:mt-6 md:mt-8">
              <TablaClientesDiaTrabajador refresh={refreshClientes} />
            </div>
          </div>
        );

      case "CLIENTES":
        return (
          <div className="w-full p-2 xs:p-3 sm:p-4 md:p-6 overflow-x-auto">
            <TablaClientes refresh={refreshClientes} />
          </div>
        );

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
      {/* Fondo cuadriculado decorativo */}
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

      {/* Contenedor principal */}
      <div className="relative z-10 flex h-screen overflow-hidden">
        {/* Static sidebar for desktop */}
        <div className="hidden md:flex md:flex-shrink-0 md:w-72">
          <BarralateralTrabajador active={active} setActive={setActive} />
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
                  <BarralateralTrabajador active={active} setActive={setActive} />
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
            <div className="w-full">
              {renderContent()}
            </div>
          </div>
        </div>
      </div>

      {/* Modales informativos - Fuera del switch para que estén siempre disponibles */}
      <ModalInfoCard
        isOpen={modalInfoMembresias}
        onClose={() => setModalInfoMembresias(false)}
        title="Membresías"
        description="En esta sección puedes inscribir clientes con membresías. Los clientes con suscripción tienen acceso ilimitado al gimnasio durante el período de su membresía activa. Puedes gestionar sus datos personales, seleccionar el tipo de membresía, asignar entrenadores, establecer fechas de inicio, gestionar métodos de pago, y realizar renovaciones. Los clientes con membresía aparecerán en tu lista de miembros activos y podrás hacer seguimiento de sus fechas de vencimiento."
      />

      <ModalInfoCard
        isOpen={modalInfoClientesDia}
        onClose={() => setModalInfoClientesDia(false)}
        title="Clientes por Día"
        description="Esta sección te permite registrar clientes que entrenan por día, es decir, clientes que no tienen una membresía activa pero que pagan una tarifa diaria para acceder al gimnasio. Puedes registrar su entrada, gestionar sus datos y hacer seguimiento de sus visitas. Este tipo de registro es ideal para clientes ocasionales o visitantes que no desean comprometerse con una membresía mensual."
      />
    </div>
  );
};

export default PanelTrabajador;
