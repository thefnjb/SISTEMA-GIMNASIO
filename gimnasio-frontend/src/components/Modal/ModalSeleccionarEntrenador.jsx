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
      className="text-white bg-black"
    >
      <ModalContent>
        <ModalHeader>
          <div className="w-full text-2xl font-bold text-center text-red-500">
            Seleccionar Entrenador
          </div>
        </ModalHeader>
        <ModalBody>
          <div className="flex flex-col gap-4">
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
                <div className="flex items-center gap-4">
                  <img
                    src={`/trainers/ver/${entrenador._id}/photo`}
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
            Cancelar
          </Button>
          <Button
            color="primary"
            onPress={handleSeleccionar}
            disabled={!selectedEntrenador}
            className="text-white bg-red-600 hover:bg-red-700 disabled:bg-gray-600 disabled:cursor-not-allowed"
          >
            Seleccionar
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default ModalSeleccionarEntrenador;
