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
import { useState, useRef, useCallback } from "react";
import api from "../../utils/axiosInstance";
import Webcam from "react-webcam";
import { motion, AnimatePresence } from "framer-motion";
import ArchiveRoundedIcon from "@mui/icons-material/ArchiveRounded";
import CameraAltIcon from '@mui/icons-material/CameraAlt';

const ModalEntrenadores = ({
  triggerText = "INGRESAR",
  title = "Entrenadores",
  onEntrenadorAgregado,
}) => {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const closeModalRef = useRef(null);
  const webcamRef = useRef(null);
  const fileInputRef = useRef(null);

  const [nombre, setNombre] = useState("");
  const [edad, setEdad] = useState("");
  const [telefono, setTelefono] = useState("");
  const [fotoPerfil, setFotoPerfil] = useState(null);
  const [preview, setPreview] = useState(null);
  const [view, setView] = useState("upload");

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

  const animationProps = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
    transition: { duration: 0.3, ease: "easeInOut" },
  };

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
    if (!nombre.trim() || !edad.trim() || !telefono.trim()) {
      mostrarAlertaInterna("warning","Todos los campos son obligatorios.");
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

      // 🔹 Cerrar modal después de éxito
      setTimeout(() => {
        if (closeModalRef.current) closeModalRef.current();
      }, 300);
    } catch (err) {
      console.error("Error al agregar entrenador:", err);
      mostrarAlertaExterna("danger", "Error al agregar entrenador.");
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
                    placeholder="Ej. Favio Alexander Coronado Zapata "
                    value={nombre}
                    onChange={(e) => {
                      const valor = e.target.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, "");
                      setNombre(valor);
                    }}
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

                  <AnimatePresence mode="wait">
                    {view === "upload" && (
                      <motion.div
                        key="upload"
                        {...animationProps}
                        className="flex flex-col items-center justify-center w-full p-6 text-center border-2 border-dashed rounded-lg border-neutral-500"
                      >
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleFileChange}
                        />
                        <div className="flex items-center gap-4">
                          <Button
                            onPress={() => fileInputRef.current?.click()}
                            startContent={<ArchiveRoundedIcon />}
                            className="text-white bg-transparent border border-neutral-500 hover:bg-neutral-700"
                          >
                            Subir foto
                          </Button>
                          <Button
                            onPress={() => setView("camera")}
                            startContent={<CameraAltIcon />}
                            className="text-white bg-transparent border border-neutral-500 hover:bg-neutral-700"
                          >
                            Usar cámara
                          </Button>
                        </div>
                      </motion.div>
                    )}

                    {view === "camera" && (
                      <motion.div key="camera" {...animationProps} className="flex flex-col items-center gap-3">
                        <Webcam
                          audio={false}
                          ref={webcamRef}
                          screenshotFormat="image/jpeg"
                          className="w-full bg-black rounded-md"
                          autoFocus={false}
                          videoConstraints={{ width: 1280, height: 720, facingMode: "user" }}
                        />
                        <Button onPress={capture} className="w-full text-white bg-red-600 hover:bg-red-700">
                          Capturar Foto
                        </Button>
                      </motion.div>
                    )}

                    {view === "preview" && preview && (
                      <motion.div key="preview" {...animationProps} className="flex flex-col items-center gap-3">
                        <p className="font-semibold">Vista Previa</p>
                        <img src={preview} alt="Vista previa del entrenador" className="object-cover w-40 h-40 rounded-full" />
                        <Button
                          onPress={() => { setPreview(null); setFotoPerfil(null); setView("upload"); }}
                          variant="light"
                          className="text-sm text-gray-300 hover:text-white"
                        >
                          Cambiar imagen
                        </Button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </ModalBody>

                <ModalFooter>
                  <Button
                    onPress={() => {
                      resetState();
                      onClose();
                    }}
                    className="text-white border-white"
                    variant="light"
                    color="danger"
                  >
                    Cerrar
                  </Button>
                  <Button
                    className="text-white bg-red-600 hover:bg-red-700 disabled:bg-gray-500"
                    onPress={agregarEntrenador}
                    isDisabled={!fotoPerfil}
                  >
                    Agregar Entrenador
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
