import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  useDisclosure,
} from "@heroui/react";
import { useState, useEffect } from "react";
import axios from "axios";

const ModalVerEntrenadores = ({ triggerText, refresh }) => {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [entrenadores, setEntrenadores] = useState([]);

  useEffect(() => {
    if (isOpen) {
      fetchEntrenadores();
    }
  }, [isOpen, refresh]);

  const fetchEntrenadores = async () => {
    try {
      const res = await axios.get("http://localhost:4000/trainers/ver", {
        withCredentials: true,
      });
      setEntrenadores(res.data);
    } catch (err) {
      console.error("Error al cargar entrenadores:", err);
    }
  };

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
        backdrop="blur"
        className="text-white bg-black"
      >
        <ModalContent>
          <ModalHeader>
            <div className="w-full text-2xl font-bold text-center text-red-500">
              Lista de Entrenadores
            </div>
          </ModalHeader>
          <ModalBody>
            <div className="flex flex-col gap-4">
              {entrenadores.map((entrenador) => (
                <div
                  key={entrenador._id}
                  className="flex items-center justify-between p-4 transition border rounded-xl bg-white/10 border-white/20"
                >
                  <div className="flex items-center gap-4">
                    <img
                      src={`http://localhost:4000/trainers/ver/${entrenador._id}/photo`}
                      alt={entrenador.nombre}
                      className="object-cover w-16 h-16 rounded-full"
                    />
                    <div>
                      <h3 className="text-lg font-semibold text-white">
                        {entrenador.nombre}
                      </h3>
                      <p className="text-sm text-gray-300">
                        Edad: {entrenador.edad} | Tel: {entrenador.telefono}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ModalBody>
          <ModalFooter>
            <Button
              color="danger"
              variant="light"
              onPress={() => onOpenChange(false)}
              className="text-white border-white"
            >
              Cerrar
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default ModalVerEntrenadores;