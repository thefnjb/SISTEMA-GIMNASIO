import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  useDisclosure,
} from "@heroui/react";
import { useState } from "react";
import DeleteIcon from '@mui/icons-material/Delete';

const ModalEntrenadores = ({
  triggerText = "Ver Entrenadores",
  title = "Entrenadores Registrados",
}) => {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  const [entrenadores, setEntrenadores] = useState([
    "Cesar Ríos",
    "Jeanpierre Saldarriaga",
  ]);

  const [nuevoEntrenador, setNuevoEntrenador] = useState("");

  const agregarEntrenador = () => {
    if (nuevoEntrenador.trim() !== "") {
      setEntrenadores([...entrenadores, nuevoEntrenador.trim()]);
      setNuevoEntrenador("");
    }
  };

  const eliminarEntrenador = (index) => {
    const nuevaLista = entrenadores.filter((_, i) => i !== index);
    setEntrenadores(nuevaLista);
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
        hideCloseButton
        backdrop="opaque"
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
                {/* Lista de entrenadores */}
                <div>
                  <label className="block mb-1 text-sm">Lista de Entrenadores</label>
                  <ul className="bg-white text-black rounded-lg p-3 space-y-2 max-h-[200px] overflow-y-auto">
                    {entrenadores.map((nombre, index) => (
                      <li
                        key={index}
                        className="flex items-center justify-between border-b pb-1 px-2 py-1 rounded-md transition-all duration-200 hover:bg-red-100 hover:text-red-700"
                      >
                        <span>{nombre}</span>
                        <button
                            onClick={() => eliminarEntrenador(index)}
                            className="text-red-600 hover:text-red-800 transition"
                            >
                            <DeleteIcon fontSize="small" />
                            </button>

                      </li>
                    ))}
                    {entrenadores.length === 0 && (
                      <li>No hay entrenadores registrados.</li>
                    )}
                  </ul>
                </div>

              
                <div>
                  <label className="block mb-1 text-sm">Agregar Nuevo Entrenador</label>
                  <Input
                    placeholder="Ej. Pedro Torres"
                    value={nuevoEntrenador}
                    onChange={(e) => setNuevoEntrenador(e.target.value)}
                    className="text-white focus:outline-none"
                    classNames={{
                      input: "focus:outline-none transition-all duration-300",
                      inputWrapper: "focus:outline-none focus:ring-0 border-none transition-all duration-300 transform hover:scale-105 focus-within:scale-105 focus-within:shadow-lg focus-within:shadow-red-500/25 hover:shadow-md hover:shadow-red-400/20 bg-gradient-to-r from-gray-50 to-gray-100 focus-within:from-red-50 focus-within:to-pink-50 hover:from-gray-100 hover:to-gray-200"
                    }}
                    style={{
                      '--tw-ring-shadow': 'none'
                    }}
                  />
                  <Button
                    className="mt-2 bg-red-600 hover:bg-red-700 text-white"
                    onPress={agregarEntrenador}
                  >
                    Agregar
                  </Button>
                </div>
              </ModalBody>

              <ModalFooter>
                <Button
                  color="danger"
                  variant="light"
                  onPress={onClose}
                  className="text-white border-white"
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

export { ModalEntrenadores };