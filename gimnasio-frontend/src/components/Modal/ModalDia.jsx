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
import api from "../../utils/axiosInstance";
import ModalPagoComprobante from "./ModalPagoComprobante";

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
    const [isPagoModalOpen, setPagoModalOpen] = useState(false);
    const [comprobantePreview, setComprobantePreview] = useState(null);

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
    setMetodoSeleccionado(null);
    setComprobantePreview(null);
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
  const formatearNombreInput = (value) => {
    return value
      .split(" ")
      .map(palabra => palabra.charAt(0).toUpperCase() + palabra.slice(1).toLowerCase())
      .join(" ");
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
    if ((metodoSeleccionado === 'yape' || metodoSeleccionado === 'plin') && !comprobantePreview) {
        return mostrarAlertaInterna("danger", "Comprobante requerido", `Debes subir el comprobante de pago para ${metodosPago[metodoSeleccionado].nombre}`);
      }
    const correctedDate = new Date(`${fechaInscripcion}T00:00:00`);

    try {
      await api.post(
        "/visits/registrarcliente",
        {
          nombre: nombreCompleto,
          fecha: correctedDate,
          metododePago: metodosPago[metodoSeleccionado].nombre,
          comprobante: comprobantePreview || undefined,
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
                  placeholder="Ej. Favio Alexander Coronado Zapata "
                  value={nombreCompleto}
                    onChange={(e) => {
                    const valor = e.target.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, "");
                    setNombreCompleto(valor);
                  }}
                  onBlur={(e) => {
                    const valorFormateado = formatearNombreInput(e.target.value);
                    setNombreCompleto(valorFormateado);
                  }}
                />

                <Input
                  label="Fecha de inscripción (automática)"
                  type="date"
                  value={fechaInscripcion}
                  readOnly
                  aria-label="Fecha de inscripción automática"
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
                        onClick={() => {
                          setMetodoSeleccionado(key);
                          // Abrir modal de comprobante automáticamente para Yape o Plin
                          if (key === 'yape' || key === 'plin') {
                            setPagoModalOpen(true);
                          }
                        }}
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
                        <div className="flex items-center gap-2">
                          {/* 🔥 Indicador de comprobante subido para Yape/Plin */}
                          {(key === 'yape' || key === 'plin') && metodoSeleccionado === key && comprobantePreview && (
                            <span className="px-2 py-1 text-xs font-semibold text-green-600 bg-green-100 rounded">
                              ✓ Comprobante
                            </span>
                          )}
                          {metodoSeleccionado === key && (
                            <span className="text-sm font-semibold">
                              Seleccionado
                            </span>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                  {(metodoSeleccionado === 'yape' || metodoSeleccionado === 'plin') && comprobantePreview && (
                    <button
                      type="button"
                      onClick={() => setPagoModalOpen(true)}
                      className="w-full p-2 mt-2 text-sm text-white transition-all duration-200 bg-gray-700 rounded hover:bg-gray-600"
                    >
                      📷 Ver/Cambiar comprobante
                    </button>
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

      {/* Modal de comprobante de pago */}
      <ModalPagoComprobante
        isOpen={isPagoModalOpen}
        onOpenChange={setPagoModalOpen}
        onUploadComplete={(dataUrl) => {
          setComprobantePreview(dataUrl); // Guardamos el base64 para enviarlo
          setPagoModalOpen(false);
          mostrarAlertaInterna("success", "Comprobante listo", "Comprobante agregado correctamente.");

        }}
      />
    </>
  );
};

export default ModalDia;