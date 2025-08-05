// ModalVerEntrenadores.js
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  useDisclosure,
} from "@heroui/react";
import { useEffect, useState } from "react";
import DeleteIcon from "@mui/icons-material/Delete";
import axios from "axios";

const ModalVerEntrenadores = ({ triggerText = "VIEW", title = "Entrenadores" }) => {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [entrenadores, setEntrenadores] = useState([]);

  const obtenerEntrenadores = async () => {
    try {
      const res = await axios.get("http://localhost:4000/trainers/ver", {
        withCredentials: true,
      });
      setEntrenadores(res.data);
    } catch (err) {
      console.error("Error al obtener entrenadores:", err);
    }
  };

  const eliminarEntrenador = async (id) => {
    try {
      await axios.delete(`http://localhost:4000/trainers/eliminar/${id}`, {
        withCredentials: true,
      });
      await obtenerEntrenadores();
    } catch (err) {
      console.error("Error al eliminar entrenador:", err);
    }
  };

  useEffect(() => {
    if (isOpen) obtenerEntrenadores();
  }, [isOpen]);

  return (
    <>
      <Button
        onPress={onOpen}
        className="text-white transition-all"
        style={{ backgroundColor: "#7a0f16" }}
      >
        {triggerText}
      </Button>

      <Modal
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        hideCloseButton
        backdrop="blur"
        isDismissable={false}
        className="bg-black text-white"
      >
        <ModalContent>
          {(onClose) => (
            <div className="bg-neutral-600 rounded-xl text-white">
              <ModalHeader>
                <div className="w-full text-center text-red-500 text-3xl font-bold">
                  {title}
                </div>
              </ModalHeader>

              <ModalBody className="space-y-4">
                <ul className="bg-white text-black rounded-lg p-3 space-y-2 max-h-[250px] overflow-y-auto">
                  {entrenadores.map((ent) => (
                    <li
                      key={ent._id}
                      className="flex justify-between items-center px-2 py-1 rounded-md hover:bg-red-100"
                    >
                      <span>
                        {ent.nombre} — {ent.edad} años — {ent.telefono}
                      </span>
                      <button
                        onClick={() => eliminarEntrenador(ent._id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <DeleteIcon fontSize="small" />
                      </button>
                    </li>
                  ))}
                  {entrenadores.length === 0 && (
                    <li>No hay entrenadores registrados.</li>
                  )}
                </ul>
              </ModalBody>

              <ModalFooter>
                <Button
                  onPress={onClose}
                  className="text-white border-white"
                  variant="light"
                  color="danger"
                >
                  Cerrar
                </Button>
              </ModalFooter>
            </div>
          )}
        </ModalContent>
      </Modal>
    </>
  );
};

export default ModalVerEntrenadores;
