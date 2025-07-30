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

const ModalSuscripcion = ({ triggerText = "Abrir Modal", title }) => {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [size, setSize] = useState("5xl");

  const sizeClassMap = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
    "2xl": "max-w-2xl",
    "3xl": "max-w-3xl",
    full: "w-full max-w-screen-lg",
  };

   const handleOpen = (customSize) => {
    setSize(customSize);
    onOpen(); // abre el modal
  };

  // Estados para los campos
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [fecha, setFecha] = useState("");
  const [celular, setCelular] = useState("");
  const [membresia, setMembresia] = useState("");
  const [entrenador, setEntrenador] = useState("");
  const [metodoSeleccionado, setMetodoSeleccionado] = useState(null);
  const [desplegado, setDesplegado] = useState(false);

  const handleSeleccion = (key) => {
    setMetodoSeleccionado(key);
    setDesplegado(false);
  };

  // limpiar campos
  const limpiarCampos = () => {
    setNombre("");
    setApellido("");
    setFecha("");
    setMembresia("");
    setEntrenador("");
    setMetodoSeleccionado(null);
    setDesplegado(false);
  };

  // Animación 
  const inputClasses = {
    input: "focus:outline-none transition-all duration-300",
    inputWrapper: "focus:outline-none focus:ring-0 border-none transition-all duration-300 transform hover:scale-105 focus-within:scale-105 focus-within:shadow-lg focus-within:shadow-red-500/25 hover:shadow-md hover:shadow-red-400/20 bg-gradient-to-r from-gray-50 to-gray-100 focus-within:from-red-50 focus-within:to-pink-50 hover:from-gray-100 hover:to-gray-200"
  };

  return (
    <>
      <Button
        onPress={() => handleOpen("5xl")}
        className="text-white transition-all duration-200 hover:scale-105 hover:shadow-lg"
        style={{ backgroundColor: "#7a0f16" }}
      >
        {triggerText}
      </Button>

      <Modal
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        hideCloseButton={true}
        size={size}
        backdrop="blur"
        isDismissable={false}
        className={`bg-black text-white ${sizeClassMap[size] || "max-w-3xl"}`}
      >
        <ModalContent>
          {(onClose) => (
            <div className="bg-neutral-600 rounded-xl text-white">
              <ModalHeader>
                <div className="w-full text-center text-red-500 text-3xl font-bold">
                  {title || "Nueva Suscripción"}
                </div>
              </ModalHeader>

              <ModalBody className="space-y-4 text-white">
                <Input
                  label="Nombre"
                  placeholder="Ingresa el nombre"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  className="text-white focus:outline-none"
                  classNames={inputClasses}
                  style={{
                    '--tw-ring-shadow': 'none'
                  }}
                />
                
                <Input
                  label="Apellido"
                  placeholder="Ingresa el apellido"
                  value={apellido}
                  onChange={(e) => setApellido(e.target.value)}
                  className="text-white focus:outline-none"
                  classNames={inputClasses}
                  style={{
                    '--tw-ring-shadow': 'none'
                  }}
                />
                
                <Input
                  label="Fecha de inicio"
                  type="date"
                  value={fecha}
                  onChange={(e) => setFecha(e.target.value)}
                  className="text-white focus:outline-none"
                  classNames={inputClasses}
                  style={{
                    '--tw-ring-shadow': 'none'
                  }}
                />
                <Input
                  label="Celular"
                  placeholder="Ingresa el número de celular"
                  value={celular}
                  onChange={(e) => setCelular(e.target.value)}
                  className="text-white focus:outline-none"
                  classNames={inputClasses}
                  style={{
                    '--tw-ring-shadow': 'none'
                  }}
                />
                <Input
                  label="Membresía"
                  placeholder="Ej. Mensual, Anual"
                  value={membresia}
                  onChange={(e) => setMembresia(e.target.value)}
                  className="text-white focus:outline-none"
                  classNames={inputClasses}
                  style={{
                    '--tw-ring-shadow': 'none'
                  }}
                />

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
                      <span className="text-sm opacity-70">
                        Selecciona una opción
                      </span>
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

                <Input
                  label="Entrenadores"
                  placeholder="Nombre del entrenador"
                  value={entrenador}
                  onChange={(e) => setEntrenador(e.target.value)}
                  className="text-white focus:outline-none"
                  classNames={inputClasses}
                  style={{
                    '--tw-ring-shadow': 'none'
                  }}
                />
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
                    // Puedes manejar el guardado aquí si quieres
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

export default ModalSuscripcion;