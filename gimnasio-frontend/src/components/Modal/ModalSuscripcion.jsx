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
import { useState } from "react";
import api from "../../utils/axiosInstance";
import DateRangeOutlinedIcon from '@mui/icons-material/DateRangeOutlined';
import FitnessCenterOutlinedIcon from '@mui/icons-material/FitnessCenterOutlined';
import ModalSeleccionarMembresia from "../Membresia/ModalSeleccionarMembresia";
import ModalSeleccionarEntrenador from "./ModalSeleccionarEntrenador";

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

  const [membresia, setMembresia] = useState(null);
  const [entrenador, setEntrenador] = useState(null);
  const [metodoSeleccionado, setMetodoSeleccionado] = useState(null);
  const [debe, setDebe] = useState("");

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

  return (
    <>
      {/* Botón para abrir modal */}
      <Button
        onPress={handleOpenModal}
        className="text-white transition-all duration-200 hover:scale-105 hover:shadow-lg"
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

      {/* Modal principal */}
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
                  <label className="block mb-2 text-sm">Tipo de Documento</label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setTipoDocumento("DNI");
                        setNumeroDocumento("");
                      }}
                      className={`flex-1 p-3 rounded-lg text-white transition-all duration-200 ${
                        tipoDocumento === "DNI"
                          ? "bg-red-600 ring-4 ring-red-400"
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
                      }}
                      className={`flex-1 p-3 rounded-lg text-white transition-all duration-200 ${
                        tipoDocumento === "CE"
                          ? "bg-red-600 ring-4 ring-red-400"
                          : "bg-gray-700 hover:bg-gray-600"
                      }`}
                    >
                      CE (Carné Extranjería)
                    </button>
                  </div>
                </div>

                <Input
                  label={`Número de ${tipoDocumento}`}
                  placeholder={tipoDocumento === "DNI" ? "12345678" : "123456789012"}
                  value={numeroDocumento}
                  onChange={(e) => handleDocumentoChange(e.target.value)}
                  maxLength={tipoDocumento === "DNI" ? 8 : 12}
                  description={
                    tipoDocumento === "DNI"
                      ? "Ingresa 8 dígitos"
                      : "Ingresa entre 9 y 12 dígitos"
                  }
                />
                <Input
                  label="Nombre y Apellido"
                  placeholder="Ingresa el nombre"
                  value={nombreCompleto}
                  onChange={(e) => {
                    const valor = e.target.value;
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
                  <label className="block mb-2 text-sm">Membresía</label>
                  <button
                    type="button"
                    onClick={() => setMembresiaOpen(true)}
                    className="flex items-center w-full gap-3 p-3 text-white transition-all duration-200 bg-black border border-red-500 rounded-lg hover:bg-gray-900 hover:scale-105 hover:shadow-lg hover:border-red-400"
                  >
                    <DateRangeOutlinedIcon className="text-red-500" />
                    <span className="text-lg font-medium">
                      {membresia
                        ? `${membresia.duracion === 12 ? "1 Año" : `${membresia.duracion} Mes${membresia.duracion > 1 ? 'es' : ''}`} - S/ ${Number(membresia.precio).toFixed(2)}`
                        : "Selecciona una membresía"
                      }
                    </span>
                  </button>
                </div>

                {/* Entrenador */}
                <div>
                  <label className="block mb-2 text-sm">Entrenador</label>
                  <button
                    type="button"
                    onClick={() => setEntrenadorModalOpen(true)}
                    className="flex items-center w-full gap-3 p-3 text-white transition-all duration-200 bg-red-600 border border-black rounded-lg hover:bg-red-700 hover:scale-105 hover:shadow-lg hover:border-gray-800"
                  >
                    <FitnessCenterOutlinedIcon className="text-white" />
                    <span className="text-lg font-medium">
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
                  <label className="block mb-1 text-sm">Método de Pago</label>
                  <div className="flex flex-col gap-2">
                    {Object.entries(metodosPago).map(([key, metodo]) => (
                      <button
                        key={key}
                        type="button"
                        className={`w-full p-3 rounded text-white flex items-center justify-between transition-all duration-200 hover:scale-105 ${metodo.color} ${metodoSeleccionado === key ? "ring-4 ring-red-400" : ""}`}
                        onClick={() => setMetodoSeleccionado(key)}
                      >
                        <div className="flex items-center gap-3">
                          <img src={metodo.icono} alt={metodo.nombre} className="w-6 h-6" />
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