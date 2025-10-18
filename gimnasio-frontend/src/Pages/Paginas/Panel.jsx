import React, { useState } from "react";
import Barralateral from "../../components/Barralateral/Barralateral";
import { CustomCard } from "../../components/Card/spacer";
import Ingresos from "./Ingresos";
import IncribirTrabajador from "../../components/Trabajadores/incribirTrabajador";
import TablaClientesAdmin from "../../components/Tabla/TablaCldia/TablaClientesAdmin";
import ModalSuscripcion from "../../components/Modal/ModalSuscripcion";
import ModalDia from "../../components/Modal/ModalDia";
import ModalEntrenadores from "../../components/Modal/ModalEntrenadores";
import Membresia from "../../components/Membresia/Membresia";
import ModalviewMembresia from "../../components/Membresia/ModalviewMembresia";
import ModalVerEntrenadores from "../../components/Modal/ModalVerEntrenadores";
import { Button } from "@heroui/react";
import TablaClientesDia from "../../components/Tabla/TablaCldia/ClientesPorDia";
import RemoveRedEyeRoundedIcon from '@mui/icons-material/RemoveRedEyeRounded';
import AddCircleOutlineRoundedIcon from '@mui/icons-material/AddCircleOutlineRounded';
import GetAppRoundedIcon from '@mui/icons-material/GetAppRounded';

function Panel() {
  const [active, setActive] = useState("INICIO");
  const [showAgregar, setShowAgregar] = useState(false);
  const [showVer, setShowVer] = useState(false);
  const [refreshClientes, setRefreshClientes] = useState(0);
  const [refreshEntrenadores, setRefreshEntrenadores] = useState(false);

  const handleClienteAgregado = () => {
    setRefreshClientes((prev) => prev + 1); 
  };

  const handleEntrenadorAgregado = () => {
    setRefreshEntrenadores((prev) => !prev);
  };

  const renderContent = () => {
    switch (active)  {
      case "INICIO":
        return (
          <div className="p-6">
            <div className="flex justify-end mb-6">
              <Button
                className="flex items-center gap-3 px-4 py-2 font-bold text-white bg-red-800 rounded shadow hover:bg-red-800"
              >
                <span
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowAgregar(true);
                  }}
                  className="text-xl cursor-pointer"
                  title="Agregar membresía"
                >
                  <AddCircleOutlineRoundedIcon/>
                </span>
                <span
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowVer(true);
                  }}
                  className="text-xl cursor-pointer"
                  title="Ver membresías"
                >
                  <RemoveRedEyeRoundedIcon/>
                </span>
                MEMBRESÍAS
              </Button>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
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
                    title="Clientes por Dia"
                    onClienteAgregado={handleClienteAgregado}
                  />
                </div>
              </CustomCard>

              <CustomCard imageUrl="/images/entrenadores.PNG">
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
          <div className="w-full p-4 overflow-x-auto">
            <TablaClientesAdmin refresh={refreshClientes} />
          </div>
        );

      default:
        return null;
    }
  };

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
        {/* Barra lateral fija */}
        <div className="flex-shrink-0 w-72">
          <Barralateral active={active} setActive={setActive} />
        </div>

        <div className="flex-1 overflow-x-auto">
          <div className="min-w-[900px]">
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Panel;
