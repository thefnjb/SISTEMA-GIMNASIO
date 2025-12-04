import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
} from "@heroui/react";
import { useState, useEffect } from "react";
import api from "../../utils/axiosInstance";

const ModalSeleccionarEntrenador = ({ isOpen, onOpenChange, onSeleccionar }) => {
  const [entrenadores, setEntrenadores] = useState([]);
  const [selectedEntrenador, setSelectedEntrenador] = useState(null);

  useEffect(() => {
    if (isOpen) {
      fetchEntrenadores();
    }
  }, [isOpen]);

  const fetchEntrenadores = async () => {
    try {
      const res = await api.get("/trainers/ver", {
        withCredentials: true,
      });
      setEntrenadores(res.data);
    } catch (err) {
      console.error("Error al cargar entrenadores:", err);
    }
  };

  const handleSeleccionar = () => {
    if (selectedEntrenador) {
      onSeleccionar(selectedEntrenador);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      backdrop="blur"
      size={{ base: "full", sm: "xl", md: "2xl" }}
      className="text-white bg-black"
      scrollBehavior="inside"
    >
      <ModalContent>
        <ModalHeader>
          <div className="w-full text-xl sm:text-2xl font-bold text-center text-red-500">
            Seleccionar Entrenador
          </div>
        </ModalHeader>
        <ModalBody className="px-3 sm:px-6">
          <div className="flex flex-col gap-3 sm:gap-4">
            {entrenadores.map((entrenador) => (
              <div
                key={entrenador._id}
                onClick={() => setSelectedEntrenador(entrenador)}
                className={`flex items-center justify-between p-4 transition cursor-pointer border rounded-xl ${
                  selectedEntrenador?._id === entrenador._id
                    ? "bg-red-600/30 border-red-500"
                    : "bg-white/10 border-white/20 hover:bg-white/20"
                }`}
              >
                <div className="flex items-center gap-2 sm:gap-4">
                  <img
                    src={`/trainers/ver/${entrenador._id}/photo`}
                    alt={entrenador.nombre}
                    className="object-cover w-12 h-12 sm:w-16 sm:h-16 rounded-full"
                  />
                  <div>
                    <h3 className="text-base sm:text-lg font-semibold text-white">
                      {entrenador.nombre}
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-300">
                      Edad: {entrenador.edad} | Tel: {entrenador.telefono}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ModalBody>
        <ModalFooter className="flex-col sm:flex-row gap-2 sm:gap-0">
          <Button
            color="danger"
            variant="light"
            onPress={() => onOpenChange(false)}
            className="w-full sm:w-auto text-white border-white"
          >
            Cancelar
          </Button>
          <Button
            color="primary"
            onPress={handleSeleccionar}
            disabled={!selectedEntrenador}
            className="w-full sm:w-auto text-white bg-red-600 hover:bg-red-700 disabled:bg-gray-600 disabled:cursor-not-allowed"
          >
            Seleccionar
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default ModalSeleccionarEntrenador;
