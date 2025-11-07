import React, { useState } from "react";
import BarralateralTrabajador from "../../components/Barralateral/BarralateralTrabajador";
import { CustomCard } from "../../components/Card/spacer";
import TablaClientes from "../../components/Tabla/TablaCldia/TablaClientes";
import ModalSuscripcion from "../../components/Modal/ModalSuscripcion";
import ModalDia from "../../components/Modal/ModalDia";
import TablaClientesDiaTrabajador from "../../components/Tabla/TablaCldia/ClientesDiaTrabajador"; // ✅ Import corregido
import GetAppRoundedIcon from "@mui/icons-material/GetAppRounded";

const PanelTrabajador = () => {
  const [active, setActive] = useState("INICIO");
  const [refreshClientes, setRefreshClientes] = useState(0);

  // 🔄 Refresca las tablas cuando se agrega un cliente o suscripción
  const handleClienteAgregado = () => {
    setRefreshClientes((prev) => prev + 1);
  };

  // 🔹 Renderiza el contenido según la opción activa del menú lateral
  const renderContent = () => {
    switch (active) {
      case "INICIO":
        return (
          <div className="p-6">
            {/* 🧩 Cards principales */}
            <div className="flex flex-wrap justify-center gap-28">
              {/* Card de Suscripción */}
              <CustomCard imageUrl="/images/suscripcion.png" className="w-72">
                <ModalSuscripcion
                  triggerText={<GetAppRoundedIcon fontSize="large" />}
                  onSuscripcionExitosa={handleClienteAgregado}
                />
              </CustomCard>

              {/* Card de Clientes por Día */}
              <CustomCard imageUrl="/images/clientespordiaa.png" className="w-72">
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
            <div className="mt-8">
              <TablaClientesDiaTrabajador refresh={refreshClientes} />
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
        {/* Barra lateral izquierda */}
        <div className="flex-shrink-0 w-72">
          <BarralateralTrabajador active={active} setActive={setActive} />
        </div>

        {/* Contenido dinámico */}
        <div className="flex-1 overflow-x-auto">
          <div className="min-w-[900px]">{renderContent()}</div>
        </div>
      </div>
    </div>
  );
};

export default PanelTrabajador;
