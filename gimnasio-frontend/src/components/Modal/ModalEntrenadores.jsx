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
import { useState, useRef } from "react";
import api from "../../utils/axiosInstance";
import ArchiveRoundedIcon from "@mui/icons-material/ArchiveRounded";

const ModalEntrenadores = ({
  triggerText = "INGRESAR",
  title = "Entrenadores",
  onEntrenadorAgregado,
}) => {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const closeModalRef = useRef(null);

  const [nombre, setNombre] = useState("");
  const [edad, setEdad] = useState("");
  const [telefono, setTelefono] = useState("");
  const [fotoPerfil, setFotoPerfil] = useState(null);

  // ✅ Alerta interna (dentro del modal)
  const [alertaInterna, setAlertaInterna] = useState({
    show: false,
    color: "default",
    message: "",
  });

  // ✅ Alerta externa (toast fuera del modal)
  const [alertaExterna, setAlertaExterna] = useState({
    show: false,
    color: "default",
    message: "",
  });

  // Mostrar alerta interna
  const mostrarAlertaInterna = (color, message) => {
    setAlertaInterna({ show: true, color, message });
    setTimeout(() => {
      setAlertaInterna({ show: false, color: "default", message: "" });
    }, 4000);
  };

  // Mostrar alerta externa
  const mostrarAlertaExterna = (color, message) => {
    setAlertaExterna({ show: true, color, message });
    setTimeout(() => {
      setAlertaExterna({ show: false, color: "default", message: "" });
    }, 5000);
  };
const agregarEntrenador = async () => {
  // Validación de campos vacíos
  if (!nombre.trim() || !edad.trim() || !telefono.trim()) {
    mostrarAlertaInterna("warning", "Todos los campos son obligatorios.");
    return;
  }

  const formData = new FormData();
  formData.append("nombre", nombre);
  formData.append("edad", edad);
  formData.append("telefono", telefono);
  if (fotoPerfil) formData.append("fotoPerfil", fotoPerfil);

  try {
    await api.post("/trainers/nuevo", formData, {
      withCredentials: true,
      headers: { "Content-Type": "multipart/form-data" },
    });

    // Limpieza
    setNombre("");
    setEdad("");
    setTelefono("");
    setFotoPerfil(null);

    if (onEntrenadorAgregado) onEntrenadorAgregado();

    // Mostrar alerta externa solo si se agrega correctamente
    mostrarAlertaExterna("success", "Entrenador agregado correctamente.");

    // Cerrar modal después del éxito
    setTimeout(() => {
      if (closeModalRef.current) closeModalRef.current();
    }, 300);

  } catch (err) {
    console.error("Error al agregar entrenador:", err);

    // Detecta si el error viene de un teléfono duplicado
    if (
      err.response?.data?.error?.includes("teléfono") ||
      err.response?.data?.code === 11000
    ) {
      mostrarAlertaInterna("danger", "Este número de teléfono ya está registrado.");
      return;
    }

    // Error genérico mostrado dentro del modal
    mostrarAlertaInterna("danger", "Este número de teléfono ya está registrado.");
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

      {/* 🔹 Alerta externa tipo toast */}
      {alertaExterna.show && (
        <div className="fixed bottom-4 right-4 w-[90%] md:w-[350px] z-[2000]">
          <Alert color={alertaExterna.color} title={alertaExterna.message} />
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
          {(onClose) => {
            closeModalRef.current = onClose;
            return (
              <div className="text-white bg-neutral-600 rounded-xl">
                <ModalHeader>
                  <div className="w-full text-3xl font-bold text-center text-red-500">
                    {title}
                  </div>
                </ModalHeader>

                <ModalBody className="space-y-4">
                {/* 🔹 Alerta interna dentro del modal */}
                {alertaInterna.show && (
                  <Alert
                    color={alertaInterna.color}
                    title={alertaInterna.message}
                  />
                )}

                  <Input
                    label="Nombre y Apellido"
                    placeholder="Ingresa el nombre"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                  />
                 <Input
                  label="Edad"
                  placeholder="Ingresa la edad"
                  type="number"
                  maxLength={2} // solo dos dígitos visibles
                  value={edad}
                  onChange={(e) => {
                    const valor = e.target.value.replace(/\D/g, ""); // solo números
                    if (valor.length <= 2) setEdad(valor); // máximo 2 números
                  }}
                />

                  <Input
                    label="Teléfono"
                    placeholder="Ingresa el teléfono"
                    type="tel"
                    maxLength={9} // límite de 9 caracteres
                    value={telefono}
                    onChange={(e) => {
                      // Acepta solo números y máximo 9 dígitos
                      const valor = e.target.value.replace(/\D/g, ""); // elimina letras o símbolos
                      if (valor.length <= 9) setTelefono(valor);
                    }}
                  />

                  {/* Botón subir archivo */}
                  <div className="flex flex-col items-start space-y-2">
                    <input
                      id="upload-foto"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => setFotoPerfil(e.target.files[0])}
                    />
                    <label htmlFor="upload-foto">
                      <Button
                        as="span"
                        className="text-white border border-white"
                        style={{
                          backgroundColor: "rgba(122, 15, 22, 0.3)",
                          backdropFilter: "blur(4px)",
                        }}
                      >
                        <ArchiveRoundedIcon />
                      </Button>
                    </label>
                    {fotoPerfil && (
                      <span className="text-sm text-white">
                        {fotoPerfil.name}
                      </span>
                    )}
                  </div>

                  <Button
                    className="mt-2 text-white bg-red-600 hover:bg-red-700"
                    onPress={agregarEntrenador}
                  >
                    Agregar
                  </Button>
                </ModalBody>

                <ModalFooter>
                  <Button
                    onPress={() => {
                      setAlertaInterna({
                        show: false,
                        color: "default",
                        message: "",
                      });
                      onClose();
                    }}
                    className="text-white border-white"
                    variant="light"
                    color="danger"
                  >
                    Cerrar
                  </Button>
                </ModalFooter>
              </div>
            );
          }}
        </ModalContent>
      </Modal>
    </>
  );
};

export default ModalEntrenadores;
