import { useState } from "react";
import { Button } from "@heroui/react";
import AddCircleOutlineRoundedIcon from "@mui/icons-material/AddCircleOutlineRounded";
import ModalInscribirTrab from "./ModalInscribirTrab";

function IncribirTrabajador() {
  const [showAgregar, setShowAgregar] = useState(false);

  return (
    <div className="p-6">
      <div className="flex justify-end mb-6">
        <Button className="flex items-center gap-3 px-4 py-2 font-bold text-white bg-red-800 rounded shadow hover:bg-red-800">
          <AddCircleOutlineRoundedIcon
            className="cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              setShowAgregar(true);
            }}
          />
          INSCRIBIR TRABAJADOR
        </Button>
      </div>

      {showAgregar && (
        <ModalInscribirTrab isOpen={showAgregar} onClose={() => setShowAgregar(false)} />
      )}
    </div>
  );
}

export default IncribirTrabajador;
