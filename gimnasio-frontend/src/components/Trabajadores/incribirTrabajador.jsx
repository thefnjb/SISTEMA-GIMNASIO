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
    <div className="p-6">
      <div className="flex justify-end mb-6">
        <Button
          className="flex items-center gap-3 px-4 py-2 font-bold text-white bg-red-800 rounded shadow hover:bg-red-800"
          onClick={() => setShowAgregar(true)}
        >
          <AddCircleOutlineRoundedIcon />
          INSCRIBIR TRABAJADOR
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
