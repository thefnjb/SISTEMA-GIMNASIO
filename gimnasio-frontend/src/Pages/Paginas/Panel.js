import React, { useState } from "react";
import Barralateral from "../../components/Barralateral/Barralateral";
import { CustomCard } from "../../components/Card/spacer";
import Ingresos from "./Ingresos";
import ModalSuscripcion from "../../components/Modal/ModalSuscripcion";
import ModalDia from "../../components/Modal/ModalDia";
import ModalEntrenadores from "../../components/Modal/ModalEntrenadores";
import ModalviewDia from "../../components/Modal/ModalviewDia";
import Membresia from "../../components/Membresia/Membresia";
import ModalviewMembresia from "../../components/Membresia/ModalviewMembresia";
import { Button } from "@heroui/react";
import ModalVerEntrenadores from "../../components/Modal/ModalVerEntrenadores";
import Busquedadclientesmeses from "../../components/busqueda/Busquedadclientesmeses";

function Panel() {
  const [active, setActive] = useState("INICIO");
  const [showAgregar, setShowAgregar] = useState(false);
  const [showVer, setShowVer] = useState(false);

  const renderContent = () => {
    switch (active) {
      case "INICIO":
       return (
  <div className="p-6">
    <div className="flex justify-end mb-6">
      <Button
        className="bg-red-800 hover:bg-red-800 text-white font-bold py-2 px-4 rounded shadow flex items-center gap-3"
      >
        <span
          onClick={(e) => {
            e.stopPropagation();
            setShowAgregar(true);
          }}
          className="text-xl cursor-pointer"
          title="Agregar membresía"
        >
          +
        </span>
        <span
          onClick={(e) => {
            e.stopPropagation();
            setShowVer(true);
          }}
          className="text-xl cursor-pointer"
          title="Ver membresías"
        >
          👁
        </span>
        Membresías
      </Button>
    </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <CustomCard imageUrl="/images/suscripcion.png">
                <ModalSuscripcion triggerText="INGRESAR" />
              </CustomCard>

              <CustomCard imageUrl="/images/clientespordiaa.png">
                <div className="flex gap-10">
                  <ModalDia triggerText="INGRESAR" title="Clientes por Dia" />
                  <ModalviewDia triggerText="VIEW" title="Clientes por Dia" />
                </div>
              </CustomCard>

              <CustomCard imageUrl="/images/entrenadores.png">
          <div className="flex gap-10">
                  <ModalEntrenadores triggerText="INGRESAR" title="Entrenadores" />
                  <ModalVerEntrenadores triggerText="VIEW" title="Entrenadores" />
                </div>
              </CustomCard>
<Busquedadclientesmeses />
            </div>
            {showAgregar && (
              <Membresia onClose={() => setShowAgregar(false)} />
            )}

            {showVer && (
              <ModalviewMembresia onClose={() => setShowVer(false)} />
            )}
          </div>
        );
      case "INGRESOS":
        return <Ingresos />;
      default:
        return null;
    }
  };

  return (
    <div className="flex">
      <Barralateral active={active} setActive={setActive} />
      <div className="flex-1">{renderContent()}</div>
    </div>
  );
}

export default Panel;
