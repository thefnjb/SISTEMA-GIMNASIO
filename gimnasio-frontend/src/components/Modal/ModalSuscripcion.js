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
import axios from "axios";
import DateRangeOutlinedIcon from '@mui/icons-material/DateRangeOutlined';
import FitnessCenterOutlinedIcon from '@mui/icons-material/FitnessCenterOutlined';
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
  // Estados para las alertas
  const [alerta, setAlerta] = useState({ show: false, type: "", message: "", title: "" });

  const [nombreCompleto, setNombreCompleto] = useState("");
  const [telefono, setTelefono] = useState("");
  const [fechaInicio, setFechaInicio] = useState(() => {
    const hoy = new Date();
    return hoy.toISOString().split("T")[0];
  });

  const [membresia, setMembresia] = useState(null);
  const [entrenador, setEntrenador] = useState(null);
  const [metodoSeleccionado, setMetodoSeleccionado] = useState(null);

  // Función para mostrar alertas
  const mostrarAlerta = (type, title, message) => {
    setAlerta({ show: true, type, title, message });
    setTimeout(() => {
      setAlerta({ show: false, type: "", message: "", title: "" });
    }, 6000); 
  };

  // Guardar con nuevo contrato de backend
  const guardarSuscripcion = async (onClose) => {
    // Validaciones
    if (!nombreCompleto.trim()) {
      return mostrarAlerta("warning", "Campo obligatorio", "El nombre completo es obligatorio");
    }
    if (!/^\d{9}$/.test(telefono)) {
      return mostrarAlerta("warning", "Teléfono inválido", "El teléfono debe tener 9 dígitos");
    }
    if (!membresia?._id) {
      return mostrarAlerta("warning", "Membresía requerida", "Selecciona una membresía");
    }
    if (metodoSeleccionado && !["yape","plin","efectivo"].includes(metodoSeleccionado)) {
      return mostrarAlerta("danger", "Método de pago inválido", "El método de pago seleccionado no es válido");
    }

    try {
      const nuevoMiembro = {
        nombreCompleto: nombreCompleto.trim(),
        telefono,
        fechaIngreso: fechaInicio,
        mensualidad: membresia._id,
        entrenador: entrenador?._id,
        estadoPago: metodoSeleccionado ? "Pagado" : "Pendiente",
        metodoPago: metodoSeleccionado || undefined,
      };

      await axios.post(
        "http://localhost:4000/members/miembros",
        nuevoMiembro,
        { withCredentials: true }
      );
      
      mostrarAlerta("success", "¡Éxito!", "Suscripción registrada correctamente");
      
      setTimeout(() => {
        limpiarCampos();
        onClose();
      }, 2000);
      
    } catch (err) {
      console.error("Error al registrar suscripción:", err);
      const mensaje = err?.response?.data?.error || "Ocurrió un error al registrar la suscripción.";
      
      if (err?.response?.status === 409) {
        mostrarAlerta("warning", "Dato duplicado", mensaje);
      } else {
        mostrarAlerta("danger", "Error en el registro", mensaje);
      }
    }
  };

  const limpiarCampos = () => {
    setNombreCompleto("");
    setTelefono("");
    setFechaInicio("");
    setMembresia(null);
    setEntrenador(null);
    setMetodoSeleccionado(null);
    setAlerta({ show: false, type: "", message: "", title: "" });
  };

  const handleSeleccionarEntrenador = (entrenadorSeleccionado) => {
    setEntrenador(entrenadorSeleccionado);
    setEntrenadorModalOpen(false);
  };

  return (
    <>
      {/* Botón para abrir modal */}
      <Button
        onPress={onOpen}
        className="text-white transition-all duration-200 hover:scale-105 hover:shadow-lg"
        style={{ backgroundColor: "#7a0f16" }}
      >
        {triggerText}
      </Button>

      {/* Toast de alerta fuera del modal */}
      {alerta.show && (
        <div className="fixed bottom-4 right-4 w-[90%] md:w-[350px] z-[2000] animate-in slide-in-from-bottom">
          <Alert
            color={alerta.type}
            title={alerta.title}
            description={alerta.message}
            variant="faded"
            className="shadow-lg"
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
                <Input
                  label="Nombre y Apellido"
                  placeholder="Ingresa el nombre"
                  value={nombreCompleto}
                  onChange={(e) => setNombreCompleto(e.target.value)}
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
                />

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
