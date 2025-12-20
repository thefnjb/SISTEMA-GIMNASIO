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
  CircularProgress,
} from "@heroui/react";
import { useState, useRef, useEffect } from "react";
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
  const [tipoDocumento, setTipoDocumento] = useState("DNI");
  const [numeroDocumento, setNumeroDocumento] = useState("");
  const [isDniLoading, setIsDniLoading] = useState(false);
  const [origenNombre, setOrigenNombre] = useState('reniec');
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

  // Maneja selección de archivo desde el input
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFotoPerfil(file);

    const reader = new FileReader();
    reader.onload = (ev) => {
      setPreview(ev.target.result);
      setView("preview");
    };
    reader.readAsDataURL(file);
  };

  // Convierte dataURL a File
  const dataURLtoFile = (dataurl, filename) => {
    const arr = dataurl.split(',');
    const mimeMatch = arr[0].match(/:(.*?);/);
    const mime = mimeMatch ? mimeMatch[1] : 'image/jpeg';
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
  };

  // Captura imagen desde la webcam
  const capture = () => {
    if (!webcamRef.current) return;
    const screenshot = webcamRef.current.getScreenshot();
    if (!screenshot) return;
    const file = dataURLtoFile(screenshot, "captura.jpg");
    setFotoPerfil(file);
    setPreview(screenshot);
    setView("preview");
  };

  // Formatear nombre para input
  const formatearNombreInput = (value) => {
    return value
      .split(" ")
      .map(palabra => palabra.charAt(0).toUpperCase() + palabra.slice(1).toLowerCase())
      .join(" ");
  };

  // Consulta RENIEC para DNI
  const handleDniLookup = async () => {
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
          setNombre(formatearNombreInput(nombre));
        } else {
          console.warn('Respuesta RENIEC inesperada:', data);
        }
      }
    } catch (error) {
      const mensaje = error?.response?.data?.error || "No se pudo encontrar el DNI.";
      mostrarAlertaInterna("warning", mensaje);
      setNombre(""); // Limpiar nombre si hay error
    } finally {
      setIsDniLoading(false);
    }
  };

  // Auto-búsqueda del DNI cuando alcance 8 dígitos
  useEffect(() => {
    if (origenNombre === 'reniec' && tipoDocumento === 'DNI' && numeroDocumento.length === 8) {
      handleDniLookup();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [numeroDocumento, tipoDocumento, origenNombre]);

  // Resetea el estado del modal
  const resetState = () => {
    setNombre("");
    setTipoDocumento("DNI");
    setNumeroDocumento("");
    setOrigenNombre('reniec');
    setEdad("");
    setTelefono("");
    setFotoPerfil(null);
    setPreview(null);
    setView("upload");
  };

  const agregarEntrenador = async () => {
    if (!nombre.trim() || !edad.trim() || !telefono.trim()) {
      mostrarAlertaInterna("warning","Todos los campos son obligatorios.");
      return;
    }

    // Validar documento si se proporciona
    if (tipoDocumento && numeroDocumento) {
      if (tipoDocumento === "DNI" && numeroDocumento.length !== 8) {
        mostrarAlertaInterna("warning", "El DNI debe tener 8 dígitos.");
        return;
      }
      if (tipoDocumento === "CE" && (numeroDocumento.length < 9 || numeroDocumento.length > 12)) {
        mostrarAlertaInterna("warning", "El CE debe tener entre 9 y 12 dígitos.");
        return;
      }
    }

  const formData = new FormData();
  formData.append("nombre", nombre.trim());
  formData.append("edad", edad);
  formData.append("telefono", telefono);
  if (tipoDocumento) formData.append("tipoDocumento", tipoDocumento);
  if (numeroDocumento) formData.append("numeroDocumento", numeroDocumento.trim().replace(/\s+/g, ''));
  if (fotoPerfil) formData.append("fotoPerfil", fotoPerfil);

  try {
    await api.post("/trainers/nuevo", formData, {
      withCredentials: true,
      headers: { "Content-Type": "multipart/form-data" },
    });

      // Limpieza
      resetState();

    if (onEntrenadorAgregado) onEntrenadorAgregado();

    // Mostrar alerta externa solo si se agrega correctamente
    mostrarAlertaExterna("success", "Entrenador agregado correctamente.");

      // 🔹 Cerrar modal después de éxito
      setTimeout(() => {
        if (closeModalRef.current) closeModalRef.current();
      }, 300);
    } catch (err) {
      console.error("Error al agregar entrenador:", err);
      const mensajeError = err?.response?.data?.error || "Error al agregar entrenador.";
      mostrarAlertaExterna("danger", mensajeError);
      mostrarAlertaInterna("danger", mensajeError);
    }
  };

  return (
    <>
      <Button
        onPress={onOpen}
        className="text-white transition-all"
        style={{ backgroundColor: 'var(--color-botones)' }}
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
        size={{ base: "full", sm: "lg", md: "xl" }}
        backdrop="blur"
        isDismissable={false}
        className="text-white bg-black"
        scrollBehavior="inside"
      >
        <ModalContent>
          {(onClose) => {
            closeModalRef.current = onClose;

            return (
              <div className="text-white bg-neutral-600 rounded-xl">
                <ModalHeader>
                  <div className="w-full text-3xl font-bold text-center text-color-acentos">
                    {title}
                  </div>
                </ModalHeader>

                <ModalBody className="space-y-3 sm:space-y-4 max-h-[70vh] overflow-y-auto px-3 sm:px-6">
                  {/* 🔹 Alerta interna dentro del modal */}
                  {alertaInterna.show && (
                    <Alert
                      color={alertaInterna.color}
                      title={alertaInterna.message}
                    />
                  )}

                  {/* Tipo de Documento */}
                  <div>
                    <label className="block mb-2 text-xs sm:text-sm">Tipo de Documento</label>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setTipoDocumento("DNI");
                          setNumeroDocumento("");
                          setOrigenNombre("reniec"); // Reset to default for DNI
                        }}
                        className={`flex-1 p-3 rounded-lg text-white transition-all duration-200 ${
                          tipoDocumento === "DNI"
                            ? "bg-color-botones ring-4 ring-color-acentos"
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
                        className={`flex-1 p-3 rounded-lg text-white transition-all duration-200 ${
                          tipoDocumento === "CE"
                            ? "bg-color-botones ring-4 ring-color-acentos"
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
                      <label className="block mb-2 text-xs sm:text-sm">Origen Nombre</label>
                      <div className="flex flex-col sm:flex-row gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setOrigenNombre('reniec');
                            if (numeroDocumento.length === 8) {
                              handleDniLookup();
                            }
                          }}
                          className={`flex-1 p-3 rounded-lg text-white transition-all duration-200 ${
                            origenNombre === 'reniec'
                              ? "bg-color-botones ring-4 ring-color-acentos"
                              : "bg-gray-700 hover:bg-gray-600"
                          }`}
                        >
                          Consultar RENIEC
                        </button>
                        <button
                          type="button"
                          onClick={() => setOrigenNombre('manual')}
                          className={`flex-1 p-3 rounded-lg text-white transition-all duration-200 ${
                            origenNombre === 'manual'
                              ? "bg-color-botones ring-4 ring-color-acentos"
                              : "bg-gray-700 hover:bg-gray-600"
                          }`}
                        >
                          Manual
                        </button>
                      </div>
                      {origenNombre === 'reniec' && (
                        <span className="block mt-2 text-xs text-gray-300">La app consultará RENIEC al completar 8 dígitos.</span>
                      )}
                      {origenNombre === 'manual' && (
                        <span className="block mt-2 text-xs text-gray-300">Modo manual: escribe el nombre directamente.</span>
                      )}
                    </div>
                  )}

                  {/* Número de Documento */}
                  <Input
                    label={tipoDocumento === "DNI" ? "Número de DNI" : "Número de CE"}
                    placeholder={tipoDocumento === "DNI" ? "Ingresa 8 dígitos" : "Ingresa 9-12 dígitos"}
                    value={numeroDocumento}
                    onChange={(e) => {
                      const valor = e.target.value.replace(/\D/g, ""); // Solo números
                      if (tipoDocumento === "DNI" && valor.length <= 8) {
                        setNumeroDocumento(valor);
                      } else if (tipoDocumento === "CE" && valor.length <= 12) {
                        setNumeroDocumento(valor);
                      }
                    }}
                    maxLength={tipoDocumento === "DNI" ? 8 : 12}
                    endContent={
                      tipoDocumento === "DNI" && numeroDocumento.length === 8 && isDniLoading && (
                        <CircularProgress size="sm" aria-label="Cargando..." />
                      )
                    }
                  />

                  <Input
                    label="Nombre y Apellido"
                    placeholder="Ej. Favio Alexander Coronado Zapata "
                    value={nombre}
                    onChange={(e) => {
                      if (origenNombre === 'manual') {
                        const valor = e.target.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, "");
                        setNombre(valor);
                      }
                    }}
                    isReadOnly={origenNombre === 'reniec' && tipoDocumento === 'DNI'}
                    description={origenNombre === 'reniec' && tipoDocumento === 'DNI' ? "Se completará automáticamente desde RENIEC" : ""}
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
                        <Button onPress={capture} className="w-full text-white" style={{ backgroundColor: 'var(--color-botones)' }}>
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
                    className="text-white disabled:bg-gray-500"
                    style={{ backgroundColor: 'var(--color-botones)' }}
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
