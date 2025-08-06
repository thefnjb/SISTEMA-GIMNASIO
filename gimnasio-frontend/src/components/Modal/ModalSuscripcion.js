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
import { useEffect, useState } from "react";
import axios from "axios";

const metodosPago = {
  yape: { nombre: "Yape", color: "bg-purple-700", icono: "/iconos/yape.png" },
  plin: { nombre: "Plin", color: "bg-blue-600", icono: "/iconos/plin.png" },
  efectivo: { nombre: "Efectivo", color: "bg-green-600", icono: "/iconos/eefctivo.png" },
};

const ModalSuscripcion = ({ triggerText = "Nueva Suscripción" }) => {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [size, setSize] = useState("5xl");

  // Estados del formulario
  const [nombre, setNombre] = useState("");
  const [celular, setCelular] = useState("");
  const [fechaInicio, setFechaInicio] = useState("");
  const [membresia, setMembresia] = useState("");
  const [entrenador, setEntrenador] = useState("");
  const [metodoSeleccionado, setMetodoSeleccionado] = useState(null);

  // Listas desde el backend
  const [membresias, setMembresias] = useState([]);
  const [entrenadores, setEntrenadores] = useState([]);

  // Cargar datos al abrir modal
  useEffect(() => {
    if (isOpen) {
      axios.get("http://localhost:4000/plans/vermembresia", { withCredentials: true })
        .then(res => setMembresias(res.data))
        .catch(err => console.error("Error al cargar membresías:", err));

      axios.get("http://localhost:4000/trainers/ver", { withCredentials: true })
        .then(res => setEntrenadores(res.data))
        .catch(err => console.error("Error al cargar entrenadores:", err));
    }
  }, [isOpen]);

  // Guardar suscripción
  const guardarSuscripcion = async (onClose) => {
    // Validación de campos obligatorios
    if (!nombre || !celular || !membresia || !entrenador || !fechaInicio) {
      alert("Por favor completa todos los campos obligatorios");
      return;
    }

    try {
      await axios.post("http://localhost:4000/members/registrarmiembros", {
        nombre,
        celular,
        membresia,
        entrenador,
        estadoPago: metodoSeleccionado ? "Pagado" : "Pendiente",
        metodoPago: metodoSeleccionado ? metodosPago[metodoSeleccionado].nombre : "Pendiente",
        ultimoPago: fechaInicio,
        renovacion: fechaInicio,
      }, { withCredentials: true });
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

  // Limpiar campos
  const limpiarCampos = () => {
    setNombre("");
    setCelular("");
    setFechaInicio("");
    setMembresia("");
    setEntrenador("");
    setMetodoSeleccionado(null);
  };

  return (
    <>
      <Button
        onPress={() => setSize("5xl") || onOpen()}
        className="text-white transition-all duration-200 hover:scale-105 hover:shadow-lg"
        style={{ backgroundColor: "#7a0f16" }}
      >
        {triggerText}
      </Button>

      <Modal
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        hideCloseButton
        size={size}
        backdrop="blur"
        isDismissable={false}
        className="bg-black text-white max-w-4xl"
      >
        <ModalContent>
          {(onClose) => (
            <div className="bg-neutral-600 rounded-xl text-white">
              <ModalHeader>
                <div className="w-full text-center text-red-500 text-3xl font-bold">
                  Nueva Suscripción
                </div>
              </ModalHeader>

              <ModalBody className="space-y-4">
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

                {/* Selección de Membresía */}
                <div>
                  <label className="block mb-1 text-sm">Membresía</label>
                  <select
                    value={membresia}
                    onChange={(e) => setMembresia(e.target.value)}
                    className="w-full p-2 rounded bg-gray-200 text-black"
                  >
                    <option value="">Selecciona una membresía</option>
                    {membresias.map((m) => (
                      <option key={m._id} value={m._id}>
                        {m.titulo} — S/ {m.precio}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Selección de Entrenador */}
                <div>
                  <label className="block mb-1 text-sm">Entrenador</label>
                  <select
                    value={entrenador}
                    onChange={(e) => setEntrenador(e.target.value)}
                    className="w-full p-2 rounded bg-gray-200 text-black"
                  >
                    <option value="">Selecciona un entrenador</option>
                    {entrenadores.map((e) => (
                      <option key={e._id} value={e._id}>
                        {e.nombre} — {e.edad} años
                      </option>
                    ))}
                  </select>
                </div>

                {/* Método de pago */}
            <div>
              <label className="block mb-1 text-sm">Método de Pago</label>
              <div className="flex flex-col gap-2">
                {Object.entries(metodosPago).map(([key, metodo]) => (
                  <button
                    key={key}
                    type="button"
                    className={`w-full p-3 rounded text-white flex items-center justify-between ${metodo.color} ${metodoSeleccionado === key ? "ring-4 ring-red-400" : ""}`}
                    onClick={() => setMetodoSeleccionado(key)}
                  >
                    <div className="flex items-center gap-3">
                      <img src={metodo.icono} alt={metodo.nombre} className="w-6 h-6" />
                      <span className="text-lg font-medium">{metodo.nombre}</span>
                    </div>
                    {metodoSeleccionado === key && <span className="text-sm font-semibold">Seleccionado</span>}
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
                  onPress={() => guardarSuscripcion(onClose)}
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

export default ModalSuscripcion;