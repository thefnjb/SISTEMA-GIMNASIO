import React, { useState } from "react";
import BarralateralTrabajador from "../../components/Barralateral/BarralateralTrabajador";
import { CustomCard } from "../../components/Card/spacer";
import TablaClientes from "../../components/Tabla/TablaCldia/TablaClientes";
import ModalSuscripcion from "../../components/Modal/ModalSuscripcion";
import ModalDia from "../../components/Modal/ModalDia";
import TablaClientesDia from "../../components/Tabla/TablaCldia/ClientesPorDia";
import GetAppRoundedIcon from '@mui/icons-material/GetAppRounded';

const PanelTrabajador = () => {
  const [active, setActive] = useState("INICIO");
  const [refreshClientes, setRefreshClientes] = useState(0);

  const handleClienteAgregado = () => {
    setRefreshClientes((prev) => prev + 1);
  };

  const renderContent = () => {
    switch (active) {
      case "INICIO":
        return (
          <div className="p-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <CustomCard imageUrl="/images/suscripcion.png">
                <ModalSuscripcion
                  triggerText={<GetAppRoundedIcon fontSize="large" />}
                  onSuscripcionExitosa={handleClienteAgregado}
                />
              </CustomCard>

              <CustomCard imageUrl="/images/clientespordiaa.png">
                <div className="flex gap-10">
                  <ModalDia
                    triggerText={<GetAppRoundedIcon fontSize="large" />}
                    title="Clientes por Día"
                    onClienteAgregado={handleClienteAgregado}
                  />
                </div>
              </CustomCard>
            </div>

            <div className="mt-4 sm:mt-6 md:mt-8 lg:mt-10 xl:mt-12">
              <TablaClientesDia refresh={refreshClientes} />
            </div>
          </div>
        );

      case "CLIENTES":
        return (
          <div className="w-full p-4 overflow-x-auto">
            <TablaClientes refresh={refreshClientes} />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="relative w-full min-h-screen bg-white">
      {/* Fondo cuadriculado */}
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
        {/* Barra lateral fija */}
        <div className="flex-shrink-0 w-72">
          <BarralateralTrabajador active={active} setActive={setActive} />
        </div>

        <div className="flex-1 overflow-x-auto">
          <div className="min-w-[900px]">{renderContent()}</div>
        </div>
      </div>
    </div>
  );
};

export default PanelTrabajador;
