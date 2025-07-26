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

const metodosPago = {
  yape: {
    nombre: "Yape",
    color: "bg-purple-700",
    icono: "/iconos/yape.png",
  },
  plin: {
    nombre: "Plin",
    color: "bg-blue-600",
    icono: "/iconos/plin.png",
  },
  efectivo: {
    nombre: "Efectivo",
    color: "bg-green-600",
    icono: "/iconos/eefctivo.png",
  },
};

const ModalDia = ({ triggerText = "Abrir Modal", title = "Registro del Día" }) => {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  const [nombreCompleto, setNombreCompleto] = useState("");
  const [fechaInscripcion, setFechaInscripcion] = useState("");
  const [metodoSeleccionado, setMetodoSeleccionado] = useState(null);
  const [desplegado, setDesplegado] = useState(false);

  const handleSeleccion = (key) => {
    setMetodoSeleccionado(key);
    setDesplegado(false);
  };

  const limpiarCampos = () => {
    setNombreCompleto("");
    setFechaInscripcion("");
    setMetodoSeleccionado(null);
    setDesplegado(false);
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
                <Input
                  label="Nombre y Apellido"
                  placeholder="Ej. Juan Pérez"
                  value={nombreCompleto}
                  onChange={(e) => setNombreCompleto(e.target.value)}
                  className="text-white focus:outline-none"
                  classNames={{
                    input: "focus:outline-none transition-all duration-300",
                    inputWrapper: "focus:outline-none focus:ring-0 border-none transition-all duration-300 transform hover:scale-105 focus-within:scale-105 focus-within:shadow-lg focus-within:shadow-red-500/25 hover:shadow-md hover:shadow-red-400/20 bg-gradient-to-r from-gray-50 to-gray-100 focus-within:from-red-50 focus-within:to-pink-50 hover:from-gray-100 hover:to-gray-200"
                  }}
                  style={{
                    '--tw-ring-shadow': 'none'
                  }}
                />

                <Input
                  label="Fecha de inscripción"
                  type="date"
                  value={fechaInscripcion}
                  onChange={(e) => setFechaInscripcion(e.target.value)}
                  className="text-white focus:outline-none"
                  classNames={{
                    input: "focus:outline-none transition-all duration-300",
                    inputWrapper: "focus:outline-none focus:ring-0 border-none transition-all duration-300 transform hover:scale-105 focus-within:scale-105 focus-within:shadow-lg focus-within:shadow-red-500/25 hover:shadow-md hover:shadow-red-400/20 bg-gradient-to-r from-gray-50 to-gray-100 focus-within:from-red-50 focus-within:to-pink-50 hover:from-gray-100 hover:to-gray-200"
                  }}
                  style={{
                    '--tw-ring-shadow': 'none'
                  }}
                />

                {/* Selector visual para método de pago */}
                <div>
                  <label className="block mb-1 text-sm">Método de Pago</label>
                  <div
                    className={`w-full border rounded-lg p-2 cursor-pointer flex justify-between items-center transition-all duration-300 transform hover:scale-105 hover:shadow-md ${
                      metodoSeleccionado
                        ? `${metodosPago[metodoSeleccionado].color} text-white hover:shadow-lg`
                        : "bg-white text-black hover:shadow-red-400/20 hover:from-gray-100 hover:to-gray-200"
                    }`}
                    onClick={() => setDesplegado(!desplegado)}
                  >
                    {metodoSeleccionado ? (
                      <div className="flex items-center justify-between w-full">
                        <span>{metodosPago[metodoSeleccionado].nombre}</span>
                        <img
                          src={metodosPago[metodoSeleccionado].icono}
                          alt={metodosPago[metodoSeleccionado].nombre}
                          className="w-6 h-6 object-contain transition-transform duration-200 hover:scale-110"
                        />
                      </div>
                    ) : (
                      <span className="text-sm opacity-70">Selecciona una opción</span>
                    )}
                  </div>

                  {desplegado && (
                    <div className="mt-2 space-y-2 animate-in slide-in-from-top-2 duration-300">
                      {Object.entries(metodosPago).map(([key, metodo]) => (
                        <div
                          key={key}
                          className={`cursor-pointer flex justify-between items-center rounded-lg p-2 text-white transition-all duration-200 transform hover:scale-105 hover:shadow-lg ${metodo.color}`}
                          onClick={() => handleSeleccion(key)}
                        >
                          <span>{metodo.nombre}</span>
                          <img
                            src={metodo.icono}
                            alt={metodo.nombre}
                            className="w-6 h-6 object-contain transition-transform duration-200 hover:scale-110"
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </ModalBody>

              <ModalFooter>
                <Button
                  color="danger"
                  variant="light"
                  onPress={() => {
                    limpiarCampos();
                    onClose();
                  }}
                  className="text-white border-white transition-all duration-200 hover:scale-105"
                >
                  Cerrar
                </Button>
                <Button
                  color="primary"
                  onPress={() => {
                    // Aquí puedes guardar la info
                    onClose();
                    limpiarCampos();
                  }}
                  className="bg-red-600 hover:bg-red-700 text-white transition-all duration-200 hover:scale-105 hover:shadow-lg"
                >
                  Guardar
                </Button>
              </ModalFooter>
            </div>
          )}
        </ModalContent>
      </Modal>
    </>
  );
};

export { ModalDia };