import { useState } from "react";
import { Button } from "@heroui/react";
import AddCircleOutlineRoundedIcon from "@mui/icons-material/AddCircleOutlineRounded";
import ModalInscribirTrab from "./ModalInscribirTrab";
import TablaTrabajadores from "./Tablatrabajador"; 

function IncribirTrabajador() {
  const [showAgregar, setShowAgregar] = useState(false);
  const [refresh, setRefresh] = useState(0); 

  const handleClose = () => {
    setShowAgregar(false);
    setRefresh((prev) => prev + 1); 
  };

  return (
    <div className="p-3 sm:p-4 md:p-6">
      <div className="flex justify-end mb-4 sm:mb-6">
        <Button
          className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 text-sm sm:text-base font-bold text-white bg-color-botones rounded shadow"
          style={{ backgroundColor: 'var(--color-botones)' }}
          onClick={() => setShowAgregar(true)}
        >
          <AddCircleOutlineRoundedIcon className="text-lg sm:text-xl" />
          <span className="hidden sm:inline">INSCRIBIR TRABAJADOR</span>
          <span className="sm:hidden">AGREGAR</span>
        </Button>
      </div>

      {/* Tabla de trabajadores */}
      <TablaTrabajadores refresh={refresh} />

      {/* Modal de inscripción */}
      {showAgregar && (
        <ModalInscribirTrab isOpen={showAgregar} onClose={handleClose} />
      )}
    </div>
  );
}

export default IncribirTrabajador;
