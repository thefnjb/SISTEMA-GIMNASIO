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
import axios from "axios";
import ModalSeleccionarMembresia from "../Membresia/ModalSeleccionarMembresia";
import ModalSeleccionarEntrenador from "./ModalSeleccionarEntrenador";

const metodosPago = {
  yape: { nombre: "Yape", color: "bg-purple-700", icono: "/iconos/yape.png" },
  plin: { nombre: "Plin", color: "bg-blue-600", icono: "/iconos/plin.png" },
  efectivo: { nombre: "Efectivo", color: "bg-green-600", icono: "/iconos/eefctivo.png" },
};

const ModalSuscripcion = ({ triggerText = "Nueva Suscripción" }) => {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [isMembresiaOpen, setMembresiaOpen] = useState(false);
  
  const [isEntrenadorModalOpen, setEntrenadorModalOpen] = useState(false);

  const [nombre, setNombre] = useState("");
  const [celular, setCelular] = useState("");
  const [fechaInicio, setFechaInicio] = useState(() => {
    const hoy = new Date();
    return hoy.toISOString().split("T")[0];
  });

  const [membresia, setMembresia] = useState(null);
  const [entrenador, setEntrenador] = useState(null);
  const [metodoSeleccionado, setMetodoSeleccionado] = useState(null);

  

  const guardarSuscripcion = async (onClose) => {
    if (!nombre || !celular || !membresia || !entrenador || !fechaInicio) {
      alert("Por favor completa todos los campos obligatorios");
      return;
    }

    try {
      await axios.post(
        "http://localhost:4000/members/registrarmiembros",
        {
          nombre,
          celular,
          membresia: membresia._id,
          entrenador: entrenador._id,
          estadoPago: metodoSeleccionado ? "Pagado" : "Pendiente",
          metodoPago: metodoSeleccionado
            ? metodosPago[metodoSeleccionado].nombre
            : "Pendiente",
          ultimoPago: fechaInicio,
          renovacion: fechaInicio,
        },
        { withCredentials: true }
      );
      limpiarCampos();
      onClose();
    } catch (err) {
      console.error("Error al registrar suscripción:", err);
      if (err.response?.data?.error) {
        alert(`Error: ${err.response.data.error}`);
      } else {
        alert("Ocurrió un error al registrar la suscripción.");
      }
    }
  };

  const limpiarCampos = () => {
    setNombre("");
    setCelular("");
    setFechaInicio("");
    setMembresia(null);
    setEntrenador(null);
    setMetodoSeleccionado(null);
  };

  const handleSeleccionarEntrenador = (entrenadorSeleccionado) => {
    setEntrenador(entrenadorSeleccionado);
    setEntrenadorModalOpen(false);
  };

  return (
    <>
      <Button
        onPress={onOpen}
        className="text-white transition-all duration-200 hover:scale-105 hover:shadow-lg"
        style={{ backgroundColor: "#7a0f16" }}
      >
        {triggerText}
      </Button>

      <Modal
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        hideCloseButton
        size="3xl"
        backdrop="blur"
        isDismissable={false}
        className="text-white bg-black"
      >
        <ModalContent>
          {(onClose) => (
            <div className="text-white bg-neutral-600 rounded-xl">
              <ModalHeader>
                <div className="w-full text-3xl font-bold text-center text-red-500">
                  Nueva Suscripción
                </div>
              </ModalHeader>

              <ModalBody className="space-y-4 max-h-[70vh] overflow-y-auto">
                <Input
                  label="Nombre y Apellido"
                  placeholder="Ingresa el nombre"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                />
                <Input
                  label="Celular"
                  placeholder="Número de celular"
                  value={celular}
                  onChange={(e) => setCelular(e.target.value)}
                />
                <Input
                  label="Fecha de inicio"
                  type="date"
                  value={fechaInicio}
                  onChange={(e) => setFechaInicio(e.target.value)}
                />

                <div>
                  <label className="block mb-1 text-sm">Membresía</label>
                  <div className="w-full">
                    <div
                      onClick={() => setMembresiaOpen(true)}
                      className="flex items-center justify-between w-full p-2 text-black bg-gray-200 rounded cursor-pointer"
                    >
                      <span>
                        {membresia ? membresia.titulo : "Selecciona una membresía"}
                      </span>
                      <svg
                        className="w-4 h-4 text-gray-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block mb-1 text-sm">Entrenador</label>
                  <div className="w-full">
                    <div
                      onClick={() => setEntrenadorModalOpen(true)}
                      className="flex items-center justify-between w-full p-2 text-black bg-gray-200 rounded cursor-pointer"
                    >
                      <span>
                        {entrenador ? entrenador.nombre : "Selecciona un entrenador"}
                      </span>
                      <svg
                        className="w-4 h-4 text-gray-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block mb-1 text-sm">Método de Pago</label>
                  <div className="flex flex-col gap-2">
                    {Object.entries(metodosPago).map(([key, metodo]) => (
                      <button
                        key={key}
                        type="button"
                        className={`w-full p-3 rounded text-white flex items-center justify-between ${metodo.color} ${
                          metodoSeleccionado === key ? "ring-4 ring-red-400" : ""
                        }`}
                        onClick={() => setMetodoSeleccionado(key)}
                      >
                        <div className="flex items-center gap-3">
                          <img
                            src={metodo.icono}
                            alt={metodo.nombre}
                            className="w-6 h-6"
                          />
                          <span className="text-lg font-medium">{metodo.nombre}</span>
                        </div>
                        {metodoSeleccionado === key && (
                          <span className="text-sm font-semibold">Seleccionado</span>
                        )}
                      </button>
                    ))}
                  </div>
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
                  className="text-white border-white"
                >
                  Cerrar
                </Button>
                <Button
                  color="primary"
                  onPress={() => guardarSuscripcion(onClose)}
                  className="text-white bg-red-600 hover:bg-red-700"
                >
                  Guardar
                </Button>
              </ModalFooter>
            </div>
          )}
        </ModalContent>
      </Modal>

      {isMembresiaOpen && (
        <ModalSeleccionarMembresia
          isOpen={isMembresiaOpen}
          onOpenChange={setMembresiaOpen}
          onSeleccionar={(membresiaSeleccionada) => {
            setMembresia(membresiaSeleccionada);
            setMembresiaOpen(false);
          }}
        />
      )}

      <ModalSeleccionarEntrenador
        isOpen={isEntrenadorModalOpen}
        onOpenChange={setEntrenadorModalOpen}
        onSeleccionar={handleSeleccionarEntrenador}
      />
    </>
  );
};

export default ModalSuscripcion;