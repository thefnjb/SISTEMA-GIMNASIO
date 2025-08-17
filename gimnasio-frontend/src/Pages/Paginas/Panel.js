import React, { useState } from "react";
import Barralateral from "../../components/Barralateral/Barralateral";
import { CustomCard } from "../../components/Card/spacer";
import Ingresos from "./Ingresos";
import TablaClientes from "../../components/Tabla/TablaCldia/TablaClientes";
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
  const [refreshClientes, setRefreshClientes] = useState(false);
  const [refreshEntrenadores, setRefreshEntrenadores] = useState(false);

  const handleClienteAgregado = () => {
    setRefreshClientes((prev) => !prev); 
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
                Membresías
              </Button>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              <CustomCard imageUrl="/images/suscripcion.png">
                <ModalSuscripcion triggerText={<GetAppRoundedIcon fontSize="large" />} />
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
          case "CLIENTES":
  return <TablaClientes />;

          default:
            return null;
          }
          };

  return (
    <div className="flex">
      <Barralateral active={active} setActive={setActive} />
      <div className="flex-1 ml-72">{renderContent()}</div>
    </div>
  );
}

export default Panel;
