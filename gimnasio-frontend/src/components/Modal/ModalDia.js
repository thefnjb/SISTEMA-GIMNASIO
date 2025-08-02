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

const metodosPago = {
  yape: { nombre: "Yape", color: "bg-purple-700", icono: "/iconos/yape.png" },
  plin: { nombre: "Plin", color: "bg-blue-600", icono: "/iconos/plin.png" },
  efectivo: { nombre: "Efectivo", color: "bg-green-600", icono: "/iconos/eefctivo.png" },
};

const ModalDia = ({ triggerText = "Registrar Cliente por Día", title = "Registro del Día" }) => {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  const [nombreCompleto, setNombreCompleto] = useState("");
  const [fechaInscripcion, setFechaInscripcion] = useState("");
  const [metodoSeleccionado, setMetodoSeleccionado] = useState(null);

  const limpiarCampos = () => {
    setNombreCompleto("");
    setFechaInscripcion("");
    setMetodoSeleccionado(null);
  };

  const guardarCliente = async (onClose) => {
    if (!nombreCompleto.trim() || !fechaInscripcion) {
      alert("Por favor, completa el nombre y la fecha.");
      return;
    }

    try {
      await axios.post("http://localhost:4000/visits/registrarcliente", {
        nombre: nombreCompleto,
        fecha: fechaInscripcion,
        metododePago: metodoSeleccionado ? metodosPago[metodoSeleccionado].nombre : "Efectivo",
      }, { withCredentials: true });

      limpiarCampos();
      onClose();
    } catch (err) {
      console.error("Error al registrar cliente:", err);
      if (err.response?.data?.error) {
        alert(`Error: ${err.response.data.error}`);
      } else {
        alert("Ocurrió un error al registrar el cliente.");
      }
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
                <Input
                  label="Nombre y Apellido"
                  placeholder="Ej. Juan Pérez"
                  value={nombreCompleto}
                  onChange={(e) => setNombreCompleto(e.target.value)}
                />

                <Input
                  label="Fecha de inscripción"
                  type="date"
                  value={fechaInscripcion}
                  onChange={(e) => setFechaInscripcion(e.target.value)}
                />

                {/* Método de pago */}
                <div>
                  <label className="block mb-1 text-sm">Método de Pago</label>
                  <div className="flex gap-2">
                    {Object.entries(metodosPago).map(([key, metodo]) => (
                      <button
                        key={key}
                        type="button"
                        className={`p-2 rounded text-white flex items-center gap-2 ${metodo.color} ${metodoSeleccionado === key ? "ring-4 ring-red-400" : ""}`}
                        onClick={() => setMetodoSeleccionado(key)}
                      >
                        <img src={metodo.icono} alt={metodo.nombre} className="w-6 h-6" />
                        <span>{metodo.nombre}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </ModalBody>

              <ModalFooter>
                <Button
                  color="danger"
                  variant="light"
                  onPress={() => { limpiarCampos(); onClose(); }}
                  className="text-white border-white"
                >
                  Cerrar
                </Button>
                <Button
                  color="primary"
                  onPress={() => guardarCliente(onClose)}
                  className="bg-red-600 hover:bg-red-700 text-white"
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

export default ModalDia;
