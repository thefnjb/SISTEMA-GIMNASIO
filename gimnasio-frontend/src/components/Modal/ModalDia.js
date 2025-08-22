import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  useDisclosure,
  Alert,
} from "@heroui/react";
import { useState, useEffect } from "react";
import axios from "axios";

const metodosPago = {
  yape: { nombre: "Yape", color: "bg-purple-700", icono: "/iconos/yape.png" },
  plin: { nombre: "Plin", color: "bg-blue-600", icono: "/iconos/plin.png" },
  efectivo: { nombre: "Efectivo", color: "bg-green-600", icono: "/iconos/eefctivo.png" },
};

const ModalDia = ({
  triggerText = "Registrar Cliente por Día",
  title = "Registro del Día",
  onClienteAgregado,
}) => {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  const [nombreCompleto, setNombreCompleto] = useState("");
  const [fechaInscripcion, setFechaInscripcion] = useState("");
  const [metodoSeleccionado, setMetodoSeleccionado] = useState(null);

  // Estados para alertas híbridas
  const [alertaInterna, setAlertaInterna] = useState({ show: false, type: "", message: "", title: "" });
  const [alertaExterna, setAlertaExterna] = useState({ show: false, type: "", message: "", title: "" });

  useEffect(() => {
    if (isOpen) {
      const today = new Date().toLocaleDateString("en-CA");
      setFechaInscripcion(today);
    }
  }, [isOpen]);

  const limpiarCampos = () => {
    setNombreCompleto("");
    setFechaInscripcion("");
    setMetodoSeleccionado(null);
    // Limpiar solo alerta interna al cerrar modal
    setAlertaInterna({ show: false, type: "", message: "", title: "" });
  };

  // 🎯 Función para mostrar alertas DENTRO del modal (validaciones y errores)
  const mostrarAlertaInterna = (type, title, message) => {
    setAlertaInterna({ show: true, type, title, message });
    setTimeout(() => {
      setAlertaInterna({ show: false, type: "", message: "", title: "" });
    }, 4000);
  };

  // 🎯 Función para mostrar alertas FUERA del modal (éxito)
  const mostrarAlertaExterna = (type, title, message) => {
    setAlertaExterna({ show: true, type, title, message });
    setTimeout(() => {
      setAlertaExterna({ show: false, type: "", message: "", title: "" });
    }, 4000);
  };

  const guardarCliente = async (onClose) => {
    // 🚨 Validaciones - Alertas INTERNAS (dentro del modal)
    if (!nombreCompleto.trim()) {
      return mostrarAlertaInterna("warning", "Campo obligatorio", "El nombre y apellido es obligatorio");
    }

    if (!fechaInscripcion) {
      return mostrarAlertaInterna("warning", "Fecha requerida", "Selecciona una fecha de inscripción");
    }

    if (!metodoSeleccionado) {
      return mostrarAlertaInterna("warning", "Método de pago requerido", "Selecciona un método de pago");
    }

    const correctedDate = new Date(`${fechaInscripcion}T00:00:00`);

    try {
      await axios.post(
        "http://localhost:4000/visits/registrarcliente",
        {
          nombre: nombreCompleto,
          fecha: correctedDate,
          metododePago: metodosPago[metodoSeleccionado].nombre,
        },
        { withCredentials: true }
      );

      // ✅ ÉXITO - Alerta EXTERNA (fuera del modal)
      mostrarAlertaExterna("success", "¡Éxito!", "Cliente registrado exitosamente");

      // Limpiar campos y callbacks
      limpiarCampos();
      if (onClienteAgregado) onClienteAgregado();

      // Cerrar modal después de un pequeño delay
      setTimeout(() => {
        onClose();
      }, 600);

    } catch (err) {
      console.error("Error al registrar cliente:", err);
      const errorMessage = err.response?.data?.error || "Ocurrió un error al registrar el cliente.";
      
      // ❌ ERRORES DE SERVIDOR - Alertas INTERNAS (dentro del modal)
      if (err?.response?.status === 409) {
        mostrarAlertaInterna("warning", "Cliente duplicado", errorMessage);
      } else if (err?.response?.status === 400) {
        mostrarAlertaInterna("warning", "Datos inválidos", errorMessage);
      } else {
        mostrarAlertaInterna("danger", "Error del servidor", errorMessage);
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

      {/* 🌟 ALERTA EXTERNA - Solo para mensajes de ÉXITO */}
      {alertaExterna.show && (
        <div className="fixed bottom-4 right-4 w-[90%] md:w-[350px] z-[9999] animate-in slide-in-from-bottom">
          <Alert
            color={alertaExterna.type}
            title={alertaExterna.title}
            description={alertaExterna.message}
            variant="faded"
            className="shadow-lg"
            isClosable
            onClose={() => setAlertaExterna({ show: false, type: "", message: "", title: "" })}
          />
        </div>
      )}

      <Modal
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        hideCloseButton
        backdrop="blur"
        isDismissable={false}
        className="text-white bg-black"
      >
        <ModalContent>
          {(onClose) => (
            <div className="text-white bg-neutral-600 rounded-xl">
              <ModalHeader>
                <div className="w-full text-3xl font-bold text-center text-red-500">
                  {title}
                </div>
              </ModalHeader>

              <ModalBody className="space-y-4">
                {/* 🔥 ALERTA INTERNA - Para validaciones y errores */}
                {alertaInterna.show && (
                  <div className="mb-4">
                    <Alert
                      color={alertaInterna.type}
                      title={alertaInterna.title}
                      description={alertaInterna.message}
                      variant="faded"
                      className="shadow-lg"
                      isClosable
                      onClose={() => setAlertaInterna({ show: false, type: "", message: "", title: "" })}
                    />
                  </div>
                )}

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
                  <div className="flex flex-col gap-2">
                    {Object.entries(metodosPago).map(([key, metodo]) => (
                      <button
                        key={key}
                        type="button"
                        className={`w-full p-3 rounded text-white flex items-center justify-between transition-all duration-200 hover:scale-105 ${metodo.color} ${
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
                          <span className="text-lg font-medium">
                            {metodo.nombre}
                          </span>
                        </div>
                        {metodoSeleccionado === key && (
                          <span className="text-sm font-semibold">
                            Seleccionado
                          </span>
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
                  onPress={() => guardarCliente(onClose)}
                  className="text-white bg-red-600 hover:bg-red-700"
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