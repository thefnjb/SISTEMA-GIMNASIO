import React, { useState } from "react";
import BarralateralTrabajador from "../../components/Barralateral/BarralateralTrabajador";
import { CustomCard } from "../../components/Card/spacer";
import { CustomCardMobile } from "../../components/Card/CustomCardMobile";
import TablaClientes from "../../components/Tabla/TablaCldia/TablaClientes";
import ModalSuscripcion from "../../components/Modal/ModalSuscripcion";
import ModalDia from "../../components/Modal/ModalDia";
import TablaClientesDiaTrabajador from "../../components/Tabla/TablaCldia/ClientesDiaTrabajador"; // ✅ Import corregido
import GetAppRoundedIcon from "@mui/icons-material/GetAppRounded";

const PanelTrabajador = () => {
  const [active, setActive] = useState("INICIO");
  const [refreshClientes, setRefreshClientes] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // 🔄 Refresca las tablas cuando se agrega un cliente o suscripción
  const handleClienteAgregado = () => {
    setRefreshClientes((prev) => prev + 1);
  };

  // 🔹 Renderiza el contenido según la opción activa del menú lateral
  const renderContent = () => {
    switch (active) {
      case "INICIO":
        return (
          <div className="p-3 sm:p-4 md:p-6">
            {/* 🧩 Cards principales */}
            {/* Cards para móvil/tablet */}
            <div className="flex flex-col gap-4 md:hidden max-w-4xl mx-auto">
              <CustomCardMobile imageUrl="/images/suscripcion.png">
                <ModalSuscripcion
                  triggerText={<GetAppRoundedIcon fontSize="large" />}
                  onSuscripcionExitosa={handleClienteAgregado}
                />
              </CustomCardMobile>

              <CustomCardMobile imageUrl="/images/clientespordiaa.png">
                <ModalDia
                  triggerText={<GetAppRoundedIcon fontSize="large" />}
                  title="Clientes por Día"
                  onClienteAgregado={handleClienteAgregado}
                />
              </CustomCardMobile>
            </div>

            {/* Cards para desktop */}
            <div className="hidden md:grid md:grid-cols-2 gap-6 md:gap-8 max-w-4xl mx-auto">
              <CustomCard imageUrl="/images/suscripcion.png" className="w-full max-w-xs sm:max-w-sm mx-auto">
                <ModalSuscripcion
                  triggerText={<GetAppRoundedIcon fontSize="large" />}
                  onSuscripcionExitosa={handleClienteAgregado}
                />
              </CustomCard>

              <CustomCard imageUrl="/images/clientespordiaa.png" className="w-full max-w-xs sm:max-w-sm mx-auto">
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
            <div className="mt-4 sm:mt-6 md:mt-8">
              <TablaClientesDiaTrabajador refresh={refreshClientes} />
            </div>
          </div>
        );

      case "CLIENTES":
        return (
          <div className="w-full p-3 sm:p-4 md:p-6 overflow-x-auto">
            <TablaClientes refresh={refreshClientes} />
          </div>
        );

      default:
        return null;
    }
  };

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
        <div className="hidden md:flex md:flex-shrink-0">
          <div className="flex flex-col w-72">
            <BarralateralTrabajador active={active} setActive={setActive} />
          </div>
        </div>

        {/* Mobile sidebar overlay */}
        {sidebarOpen && (
          <div className="md:hidden" role="dialog" aria-modal="true">
            <div className="fixed inset-0 z-40 flex">
              <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)}></div>
              <div className="relative flex flex-col flex-1 w-full max-w-xs bg-white">
                <div className="absolute top-0 right-0 pt-2 -mr-12">
                  <button
                    type="button"
                    className="flex items-center justify-center w-10 h-10 ml-1 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-black"
                    onClick={() => setSidebarOpen(false)}
                  >
                    <span className="sr-only">Close sidebar</span>
                    <svg className="w-6 h-6 text-black" stroke="currentColor" fill="none" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <div onClick={() => setSidebarOpen(false)}>
                  <BarralateralTrabajador active={active} setActive={setActive} />
                </div>
              </div>
              <div className="flex-shrink-0 w-14"></div>
            </div>
          </div>
        )}

        {/* Main content */}
        <div className="flex flex-col flex-1 w-0 overflow-hidden">
          {/* Mobile header with hamburger button */}
          <div className="flex items-center pt-3 pl-3 md:hidden">
            <button
              type="button"
              className="-ml-0.5 -mt-0.5 h-12 w-12 inline-flex items-center justify-center rounded-md text-gray-500 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
              onClick={() => setSidebarOpen(true)}
            >
              <span className="sr-only">Open sidebar</span>
              <svg className="w-6 h-6" stroke="currentColor" fill="none" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <h1 className="ml-4 text-xl font-bold">{active}</h1>
          </div>

          {/* Content area */}
          <div className="flex-1 overflow-y-auto">
            <div className="w-full">
              {renderContent()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PanelTrabajador;
