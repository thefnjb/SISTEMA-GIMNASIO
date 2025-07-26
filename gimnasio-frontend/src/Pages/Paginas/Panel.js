import React, { useState } from 'react';
import Barralateral from "../../components/Barralateral/Barralateral";
import { CustomCard } from "../../components/Card/spacer";
import Ingresos from "./Ingresos";
import ModalSuscripcion from "../../components/Modal/ModalSuscripcion";
import { ModalDia } from "../../components/Modal/ModalDia";
import { ModalEntrenadores } from "../../components/Modal/ModalEntrenadores";



function Panel() {
  const [active, setActive] = useState("INICIO");

  const renderContent = () => {
    switch (active) {
      case "INICIO":
        return (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6">
            <CustomCard
              imageUrl="/images/suscripcion.png"
              title="Suscripcion"
            >
              <ModalSuscripcion
                triggerText="Gestionar"
                title="Gestionar Suscripciones"
              />
            </CustomCard>
            <CustomCard
              imageUrl="/images/clientes.png"
              title="Clientes"
            >
            </CustomCard>
            <CustomCard
              imageUrl="/images/clientesporvencer.png"
              title="Clientes por Vencer"
            >
            </CustomCard>

            <CustomCard
              imageUrl="/images/clientespordiaa.png"
              title="Clientes por Dia"
            >
              <ModalDia triggerText="Ingresar" title="Clientes por Dia" />
            </CustomCard>
            
            <CustomCard
              imageUrl="/images/entrenadores.png"
              title="Entrenadores"
            >
                <ModalEntrenadores triggerText="Ingresar" title="Entrenadores" />
             </CustomCard>
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
      <div className="flex-1">
        {renderContent()}
      </div>
    </div>
  );
}

export default Panel;
