import React, { useState } from 'react';
import Barralateral from "../../components/Barralateral/Barralateral";
import { CustomCard } from "../../components/Card/spacer";

function Panel() {
  const [active, setActive] = useState("INICIO");

  const renderContent = () => {
    switch (active) {
      case "INICIO":

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6">
      <CustomCard 
        imageUrl="/images/suscrip.jpg" 
        title="Suscripcion"
        
      />
      <CustomCard 
        imageUrl="/images/clientes.jpg"
        title="Clientes"
       
      />
      <CustomCard 
        imageUrl="/images/clienteven.PNG"
        title="Clientes por Vencer"
       
      />
      <CustomCard 
        imageUrl="/images/clientesdia.PNG"
        title="Clientes por Dia"
       
      />
      <CustomCard 
        imageUrl="/images/entrena.PNG"
        title="Entrenadores"
        
      />
    </div>
  );
      case "INGRESOS":
        return <h2 className="text-xl p-6">Aquí va la sección de INGRESOS</h2>;
      case "SALIDA":
        return <h2 className="text-xl p-6">Has cerrado sesión</h2>;
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
