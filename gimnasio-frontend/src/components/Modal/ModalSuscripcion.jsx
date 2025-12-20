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
import { useState, useEffect, useCallback } from "react";
import api from "../../utils/axiosInstance";
import DateRangeOutlinedIcon from '@mui/icons-material/DateRangeOutlined';
import FitnessCenterOutlinedIcon from '@mui/icons-material/FitnessCenterOutlined';
import ModalSeleccionarMembresia from "../Membresia/ModalSeleccionarMembresia";
import ModalSeleccionarEntrenador from "./ModalSeleccionarEntrenador";
import ModalPagoComprobante from "./ModalPagoComprobante";

const metodosPago = {
  yape: { nombre: "Yape", color: "bg-purple-700", icono: "/iconos/yape.png" },
  plin: { nombre: "Plin", color: "bg-blue-600", icono: "/iconos/plin.png" },
  efectivo: { nombre: "Efectivo", color: "bg-green-600", icono: "/iconos/eefctivo.png" },
};

const ModalSuscripcion = ({ triggerText = "Nueva Suscripción", onSuscripcionExitosa }) => {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [isMembresiaOpen, setMembresiaOpen] = useState(false);
  const [isEntrenadorModalOpen, setEntrenadorModalOpen] = useState(false);

  // Estados para las alertas
  const [alertaInterna, setAlertaInterna] = useState({ show: false, type: "", message: "", title: "" });
  const [alertaExterna, setAlertaExterna] = useState({ show: false, type: "", message: "", title: "" });

  // Función para obtener fecha local sin problemas de zona horaria
  const obtenerFechaLocal = () => {
    const hoy = new Date();
    const año = hoy.getFullYear();
    const mes = String(hoy.getMonth() + 1).padStart(2, '0');
    const dia = String(hoy.getDate()).padStart(2, '0');
    return `${año}-${mes}-${dia}`;
  };

  // Estados del formulario
  const [tipoDocumento, setTipoDocumento] = useState("DNI");
  const [nombreCompleto, setNombreCompleto] = useState("");
  const [numeroDocumento, setNumeroDocumento] = useState("");
  const [telefono, setTelefono] = useState("");
  const [fechaInicio, setFechaInicio] = useState(obtenerFechaLocal());
  const [isDniLoading, setIsDniLoading] = useState(false);

  const [membresia, setMembresia] = useState(null);
  const [entrenador, setEntrenador] = useState(null);
  const [metodoSeleccionado, setMetodoSeleccionado] = useState(null);
  const [debe, setDebe] = useState("");
  const [isPagoModalOpen, setPagoModalOpen] = useState(false);
  const [comprobantePreview, setComprobantePreview] = useState(null);
  const [origenNombre, setOrigenNombre] = useState('reniec');

  // Alerta dentro del modal 
  const mostrarAlertaInterna = (type, title, message) => {
    setAlertaInterna({ show: true, type, title, message });
    setTimeout(() => {
      setAlertaInterna({ show: false, type: "", message: "", title: "" });
    }, 4000);
  };

  // Alerta fuera del modal
  const mostrarAlertaExterna = (type, title, message) => {
    setAlertaExterna({ show: true, type, title, message });
    setTimeout(() => {
      setAlertaExterna({ show: false, type: "", message: "", title: "" });
    }, 4000);
  };

  const handleDniLookup = useCallback(async () => {
    // Solo consultar si el origen está configurado para usar RENIEC
    if (origenNombre !== 'reniec') return;
    if (tipoDocumento !== "DNI" || numeroDocumento.length !== 8) {
      return;
    }

    setIsDniLoading(true);
    try {
      const { data } = await api.get(`/api/reniec/dni/${numeroDocumento}`);
      if (data) {
        let nombre = null;
        if (data.nombres && data.apellido_paterno && data.apellido_materno) {
          nombre = `${data.nombres} ${data.apellido_paterno} ${data.apellido_materno}`;
        } else if (data.first_name || data.first_last_name || data.second_last_name) {
          const fn = data.first_name || '';
          const l1 = data.first_last_name || '';
          const l2 = data.second_last_name || '';
          nombre = `${fn} ${l1} ${l2}`.trim();
        } else if (data.firstName || data.lastName) {

          const fn = data.firstName || '';
          const l1 = data.firstLastName || data.lastName || '';
          const l2 = data.secondLastName || '';
          nombre = `${fn} ${l1} ${l2}`.trim();
        }

        if (nombre) {
          setNombreCompleto(formatearNombreInput(nombre));
        } else {
          // Si la estructura es diferente, intentar mostrar el objeto como depuración
          console.warn('Respuesta RENIEC inesperada:', data);
        }
      }
    } catch (error) {
      const mensaje = error?.response?.data?.error || "No se pudo encontrar el DNI.";
      mostrarAlertaInterna("warning", "Error de Búsqueda", mensaje);
      setNombreCompleto(""); // Limpiar nombre si hay error
    } finally {
      setIsDniLoading(false);
    }
  }, [numeroDocumento, tipoDocumento, origenNombre]);

  // Guardar con nuevo contrato de backend
  const guardarSuscripcion = async (onClose) => {
    // 🚨 Validaciones - Alertas INTERNAS (dentro del modal)
    if (!nombreCompleto.trim()) {
      return mostrarAlertaInterna("warning", "Campo obligatorio", "El nombre completo es obligatorio");
    }
    if (!tipoDocumento) {
      return mostrarAlertaInterna("warning", "Tipo de documento requerido", "Selecciona el tipo de documento");
    }
    if (!numeroDocumento.trim()) {
      return mostrarAlertaInterna("warning", "Número de documento requerido", "Ingresa el número de documento");
    }
    if (tipoDocumento === "DNI" && !/^\d{8}$/.test(numeroDocumento)) {
      return mostrarAlertaInterna("warning", "DNI inválido", "El DNI debe tener exactamente 8 dígitos");
    }
    if (tipoDocumento === "CE" && !/^\d{9,12}$/.test(numeroDocumento)) {
      return mostrarAlertaInterna("warning", "CE inválido", "El CE debe tener entre 9 y 12 dígitos");
    }
    if (!/^\d{9}$/.test(telefono)) {
      return mostrarAlertaInterna("warning", "Teléfono inválido", "El teléfono debe tener 9 dígitos");
    }
    if (!fechaInicio) {
      return mostrarAlertaInterna("warning", "Fecha requerida", "Selecciona una fecha de inicio");
    }
    if (!membresia?._id) {
      return mostrarAlertaInterna("warning", "Membresía requerida", "Selecciona una membresía");
    }
    if (!metodoSeleccionado) {
      return mostrarAlertaInterna("danger", "Método de pago requerido", "Debes elegir un método de pago");
    }
    
    // 🔥 VALIDACIÓN CRÍTICA: Verificar comprobante para Yape y Plin
    if ((metodoSeleccionado === 'yape' || metodoSeleccionado === 'plin') && !comprobantePreview) {
      return mostrarAlertaInterna("danger", "Comprobante requerido", `Debes subir el comprobante de pago para ${metodosPago[metodoSeleccionado].nombre}`);
    }

    try {
      const nuevoMiembro = {
        nombreCompleto: nombreCompleto.trim(),
        tipoDocumento,
        numeroDocumento: numeroDocumento.trim(),
        telefono,
        fechaIngreso: fechaInicio,
        mensualidad: membresia._id,
        entrenador: entrenador?._id,
        estadoPago: "Pagado",
        metodoPago: metodoSeleccionado,
        debe: Number(debe) || 0,
        comprobante: comprobantePreview || undefined,
      };

      await api.post(
        "/members/miembros",
        nuevoMiembro,
        { withCredentials: true }
      );

      // ÉXITO - Alerta EXTERNA 
      mostrarAlertaExterna("success", "¡Éxito!", "Suscripción registrada correctamente");
      
      if (onSuscripcionExitosa) {
        onSuscripcionExitosa();
      }

      // Cerrar modal 
      setTimeout(() => {
        limpiarCampos();
        onClose();
      }, 400);

    } catch (err) {
      console.error("Error al registrar suscripción:", err);
      const mensaje = err?.response?.data?.error || "Ocurrió un error al registrar la suscripción.";
      
      //ERRORES DE SERVIDOR - Alertas INTERNAS 
      if (err?.response?.status === 409) {
        mostrarAlertaInterna("warning", "Dato duplicado", mensaje);
      } else {
        mostrarAlertaInterna("danger", "Error en el registro", mensaje);
      }
    }
  };

  const limpiarCampos = () => {
    setNombreCompleto("");
    setTipoDocumento("DNI");
    setNumeroDocumento("");
    setTelefono("");
    setFechaInicio(obtenerFechaLocal()); // Restablecer a fecha actual
    setMembresia(null);
    setEntrenador(null);
    setMetodoSeleccionado(null);
    setDebe("");
    setComprobantePreview(null); // 🔥 Limpiar también el comprobante
    // Limpiar solo alerta interna al cerrar modal
    setAlertaInterna({ show: false, type: "", message: "", title: "" });
  };

  const handleSeleccionarEntrenador = (entrenadorSeleccionado) => {
    setEntrenador(entrenadorSeleccionado);
    setEntrenadorModalOpen(false);
  };

  // Función para manejar la apertura del modal
  const handleOpenModal = () => {
    // Resetear campos al abrir el modal
    setNombreCompleto("");
    setTipoDocumento("DNI");
    setNumeroDocumento("");
    setTelefono("");
    setFechaInicio(obtenerFechaLocal());
    setMembresia(null);
    setEntrenador(null);
    setMetodoSeleccionado(null);
    setDebe("");
    setComprobantePreview(null);
    setAlertaInterna({ show: false, type: "", message: "", title: "" });
    onOpen();
  };

  // Función para formatear nombre con primera letra en mayúscula
  const formatearNombreInput = (value) => {
    return value
      .split(" ")
      .map(palabra => palabra.charAt(0).toUpperCase() + palabra.slice(1).toLowerCase())
      .join(" ");
  };

  // Manejar cambio de número de documento
  const handleDocumentoChange = (value) => {
    const soloNumeros = value.replace(/\D/g, "");
    if (tipoDocumento === "DNI") {
      setNumeroDocumento(soloNumeros.slice(0, 8));
    } else {
      setNumeroDocumento(soloNumeros.slice(0, 12));
    }
  };

  // Auto-búsqueda del DNI: cuando el número alcance 8 dígitos para DNI y el origen sea RENIEC
  useEffect(() => {
    if (origenNombre === 'reniec' && tipoDocumento === 'DNI' && numeroDocumento.length === 8) {
      handleDniLookup();
    }
  }, [numeroDocumento, tipoDocumento, origenNombre, handleDniLookup]);

  return (
    <>
      {/* Botón para abrir modal */}
      <Button
        onPress={handleOpenModal}
        className="text-white transition-all duration-200 hover:scale-105 hover:shadow-lg bg-color-botones"
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

      {/* Modal principal */}
      <Modal
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        hideCloseButton
        size={{ base: "full", sm: "2xl", md: "3xl" }}
        backdrop="blur"
        isDismissable={!isPagoModalOpen}
        className="text-white bg-black"
        scrollBehavior="inside"
      >
        <ModalContent>
          {(onClose) => (
            <div className="text-white bg-neutral-600 rounded-xl">
              <ModalHeader>
                <div className="w-full text-lg xs:text-xl sm:text-2xl md:text-3xl font-bold text-center text-color-acentos px-2">
                  Nueva Suscripción
                </div>
              </ModalHeader>

              <ModalBody className="space-y-2 xs:space-y-3 sm:space-y-4 max-h-[70vh] overflow-y-auto px-2 xs:px-3 sm:px-6">
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
                {/* Tipo de Documento */}
                <div>
                  <label className="block mb-1.5 xs:mb-2 text-xs sm:text-sm">Tipo de Documento</label>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setTipoDocumento("DNI");
                        setNumeroDocumento("");
                        setOrigenNombre("reniec"); // Reset to default for DNI
                      }}
                      className={`flex-1 p-2 xs:p-2.5 sm:p-3 rounded-lg text-white transition-all duration-200 text-sm xs:text-base ${
                        tipoDocumento === "DNI"
                          ? "bg-color-botones ring-2 xs:ring-4 ring-color-acentos"
                          : "bg-gray-700 hover:bg-gray-600"
                      }`}
                    >
                      DNI
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setTipoDocumento("CE");
                        setNumeroDocumento("");
                        setOrigenNombre("manual"); // Force manual for CE
                      }}
                      className={`flex-1 p-2 xs:p-2.5 sm:p-3 rounded-lg text-white transition-all duration-200 text-sm xs:text-base ${
                        tipoDocumento === "CE"
                          ? "bg-color-botones ring-2 xs:ring-4 ring-color-acentos"
                          : "bg-gray-700 hover:bg-gray-600"
                      }`}
                    >
                      CE (Carné Extranjería)
                    </button>
                  </div>
                </div>

                {/* Origen para completar el nombre: RENIEC (consulta) o MANUAL (ingresar nombre) */}
                {tipoDocumento === 'DNI' && (
                  <div>
                    <label className="block mb-1.5 xs:mb-2 text-xs sm:text-sm">Origen Nombre</label>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <button
                        type="button"
                        onClick={() => setOrigenNombre('reniec')}
                        className={`flex-1 p-2 xs:p-2.5 sm:p-3 rounded-lg text-white transition-all duration-200 text-sm xs:text-base ${
                          origenNombre === 'reniec'
                            ? "bg-color-botones ring-2 xs:ring-4 ring-color-acentos"
                            : "bg-gray-700 hover:bg-gray-600"
                        }`}
                      >
                        Consultar RENIEC
                      </button>
                      <button
                        type="button"
                        onClick={() => setOrigenNombre('manual')}
                        className={`flex-1 p-2 xs:p-2.5 sm:p-3 rounded-lg text-white transition-all duration-200 text-sm xs:text-base ${
                          origenNombre === 'manual'
                            ? "bg-color-botones ring-2 xs:ring-4 ring-color-acentos"
                            : "bg-gray-700 hover:bg-gray-600"
                        }`}
                      >
                        Manual
                      </button>
                    </div>
                    {origenNombre === 'reniec' && (
                      <span className="block mt-1.5 xs:mt-2 text-[10px] xs:text-xs text-gray-300">La app consultará RENIEC al completar 8 dígitos.</span>
                    )}
                    {origenNombre === 'manual' && (
                      <span className="block mt-1.5 xs:mt-2 text-[10px] xs:text-xs text-gray-300">Modo manual: escribe el nombre directamente.</span>
                    )}
                  </div>
                )}
                
                <Input
                  label={`Número de ${tipoDocumento}`}
                  placeholder={tipoDocumento === "DNI" ? "12345678" : "123456789012"}
                  value={numeroDocumento}
                  onChange={(e) => handleDocumentoChange(e.target.value)}
                  disabled={isDniLoading}
                  maxLength={tipoDocumento === "DNI" ? 8 : 12}
                  description={
                    tipoDocumento === "DNI"
                      ? "Al salir del campo se buscará el DNI."
                      : "Ingresa entre 9 y 12 dígitos"
                  }
                />
                <Input
                  label="Nombre y Apellido"
                  placeholder="Ingresa el nombre"
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
                  label="Teléfono"
                  placeholder="984225114"
                  value={telefono}
                  onChange={(e) => setTelefono(e.target.value.replace(/\D/g, '').slice(0, 9))}  
                />
                <Input
                  label="Fecha de inicio"
                  type="date"
                  value={fechaInicio}
                  onChange={(e) => setFechaInicio(e.target.value)}
                  min={obtenerFechaLocal()} // No permitir fechas pasadas
                  className="text-white"
                />

                {/* Membresía */}
                <div>
                  <label className="block mb-1.5 xs:mb-2 text-xs xs:text-sm">Membresía</label>
                  <button
                    type="button"
                    onClick={() => setMembresiaOpen(true)}
                    className="flex items-center w-full gap-2 xs:gap-3 p-2 xs:p-2.5 sm:p-3 text-white transition-all duration-200 bg-black border rounded-lg hover:bg-gray-900 hover:scale-105 hover:shadow-lg"
                    style={{ borderColor: 'var(--color-acentos, #D72838)' }}
                  >
                    <DateRangeOutlinedIcon className="text-color-acentos text-base xs:text-lg sm:text-xl flex-shrink-0" />
                    <span className="text-sm xs:text-base sm:text-lg font-medium truncate">
                      {membresia
                        ? `${membresia.duracion === 12 ? "1 Año" : `${membresia.duracion} Mes${membresia.duracion > 1 ? 'es' : ''}`} - S/ ${Number(membresia.precio).toFixed(2)}`
                        : "Selecciona una membresía"
                      }
                    </span>
                  </button>
                </div>

                {/* Entrenador */}
                <div>
                  <label className="block mb-1.5 xs:mb-2 text-xs xs:text-sm">Entrenador</label>
                  <button
                    type="button"
                    onClick={() => setEntrenadorModalOpen(true)}
                    className="flex items-center w-full gap-2 xs:gap-3 p-2 xs:p-2.5 sm:p-3 text-white transition-all duration-200 bg-color-botones border border-black rounded-lg hover:scale-105 hover:shadow-lg hover:border-gray-800"
                  >
                    <FitnessCenterOutlinedIcon className="text-white text-base xs:text-lg sm:text-xl flex-shrink-0" />
                    <span className="text-sm xs:text-base sm:text-lg font-medium truncate">
                      {entrenador ? entrenador.nombre : "Selecciona un entrenador"}
                    </span>
                  </button>
                </div>

                {/* Campo DEBE */}
                <Input
                  label="Debe (S/)"
                  placeholder="Ej: 50.00"
                  type="number"
                  min="0"
                  value={debe}
                  onChange={(e) => setDebe(e.target.value)}
                />

                {/* Método de pago */}
                <div>
                  <label className="block mb-1.5 xs:mb-2 text-xs sm:text-sm">Método de Pago</label>
                  <div className="flex flex-col gap-2">
                    {Object.entries(metodosPago).map(([key, metodo]) => (
                      <button
                        key={key}
                        type="button"
                        className={`w-full p-2 xs:p-2.5 sm:p-3 rounded text-white flex items-center justify-between transition-all duration-200 hover:scale-105 ${metodo.color} ${metodoSeleccionado === key ? "ring-2 xs:ring-4 ring-color-acentos" : ""}`}
                        onClick={() => {
                          setMetodoSeleccionado(key);
                          // Abrir modal de comprobante automáticamente para Yape o Plin
                          if (key === 'yape' || key === 'plin') {
                            setPagoModalOpen(true);
                          } else {
                            // Si cambia a efectivo, limpiar el comprobante previo
                            setComprobantePreview(null);
                          }
                        }}
                      >
                        <div className="flex items-center gap-2 xs:gap-3 min-w-0 flex-1">
                          <img src={metodo.icono} alt={metodo.nombre} className="w-5 h-5 xs:w-6 xs:h-6 flex-shrink-0" />
                          <span className="text-sm xs:text-base sm:text-lg font-medium truncate">{metodo.nombre}</span>
                        </div>
                        <div className="flex items-center gap-1.5 xs:gap-2 flex-shrink-0">
                          {/* 🔥 Indicador de comprobante subido para Yape/Plin */}
                          {(key === 'yape' || key === 'plin') && metodoSeleccionado === key && comprobantePreview && (
                            <span className="px-1.5 xs:px-2 py-0.5 xs:py-1 text-[10px] xs:text-xs font-semibold text-green-600 bg-green-100 rounded whitespace-nowrap">
                              ✓ Comp.
                            </span>
                          )}
                          {metodoSeleccionado === key && (
                            <span className="text-xs xs:text-sm font-semibold whitespace-nowrap">Seleccionado</span>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                  
                  {/* 🔥 Botón para ver/cambiar comprobante si ya existe uno */}
                  {(metodoSeleccionado === 'yape' || metodoSeleccionado === 'plin') && comprobantePreview && (
                    <button
                      type="button"
                      onClick={() => setPagoModalOpen(true)}
                      className="w-full p-1.5 xs:p-2 mt-2 text-xs xs:text-sm text-white transition-all duration-200 bg-gray-700 rounded hover:bg-gray-600"
                    >
                      📷 Ver/Cambiar comprobante
                    </button>
                  )}
                </div>
              </ModalBody>

              <ModalFooter className="flex-col sm:flex-row gap-2 px-2 xs:px-4 sm:px-6">
                <Button
                  color="danger"
                  variant="light"
                  onPress={() => {
                    limpiarCampos();
                    onClose();
                  }}
                  className="w-full sm:w-auto text-white border-white text-sm xs:text-base"
                >
                  Cerrar
                </Button>
                <Button
                  color="primary"
                  onPress={() => guardarSuscripcion(onClose)}
                  className="w-full sm:w-auto text-white bg-color-botones text-sm xs:text-base"
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

      <ModalPagoComprobante
        isOpen={isPagoModalOpen}
        onOpenChange={setPagoModalOpen}
        onUploadComplete={(dataUrl) => {
          setComprobantePreview(dataUrl);
          setPagoModalOpen(false);
          mostrarAlertaInterna("success", "Comprobante listo", "Comprobante agregado correctamente.");
        }}
      />
    </>
  );
};

export default ModalSuscripcion;