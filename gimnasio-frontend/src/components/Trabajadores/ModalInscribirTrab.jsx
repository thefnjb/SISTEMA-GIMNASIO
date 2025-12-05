import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  Alert,
} from "@heroui/react";
import { useState, useEffect } from "react";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import api from "../../utils/axiosInstance";

const ModalInscribirTrab = ({ isOpen, onClose }) => {
  const [nombreCompleto, setNombreCompleto] = useState("");
  const [tipoDocumento, setTipoDocumento] = useState("DNI");
  const [numeroDocumento, setNumeroDocumento] = useState("");
  const [usuario, setUsuario] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isDniLoading, setIsDniLoading] = useState(false);
  const [origenNombre, setOrigenNombre] = useState('reniec');

  const [alerta, setAlerta] = useState({ show: false, color: "default", message: "" });

  const mostrarAlerta = (color, message, duration = 3000) => {
    setAlerta({ show: true, color, message });
    setTimeout(() => {
      setAlerta({ show: false, color: "default", message: "" });
    }, duration);
  };

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
          setNombreCompleto(formatearNombreInput(nombre));
        } else {
          console.warn('Respuesta RENIEC inesperada:', data);
        }
      }
    } catch (error) {
      const mensaje = error?.response?.data?.error || "No se pudo encontrar el DNI.";
      mostrarAlerta("warning", mensaje);
      setNombreCompleto(""); // Limpiar nombre si hay error
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

  const handleClose = () => {
    setNombreCompleto("");
    setTipoDocumento("DNI");
    setNumeroDocumento("");
    setUsuario("");
    setContrasena("");
    setOrigenNombre('reniec');
    setAlerta({ show: false, color: "default", message: "" });
    onClose();
  };

  const inscribirTrabajador = async () => {
    if (!nombreCompleto.trim() || !usuario.trim() || !contrasena.trim()) {
      mostrarAlerta("warning", "Todos los campos son obligatorios.");
      return;
    }

    setIsLoading(true);
    try {
      await api.post("/workers/crear-trabajador", {
        nombre: nombreCompleto,
        tipoDocumento: tipoDocumento || undefined,
        numeroDocumento: numeroDocumento.trim() || undefined,
        nombreUsuario: usuario,
        password: contrasena,
      });

      mostrarAlerta("success", "Trabajador inscrito correctamente.", 2000);

      setTimeout(() => {
        handleClose();
      }, 2000);

    } catch (err) {
      console.error("Error al inscribir trabajador:", err);
      const errorMessage = err.response?.data?.error || "Error al inscribir trabajador.";
      mostrarAlerta("danger", errorMessage);
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={handleClose}
      hideCloseButton
      backdrop="blur"
      isDismissable={!isLoading}
      size={{ base: "full", sm: "lg", md: "xl" }}
      className="text-white bg-black"
      scrollBehavior="inside"
    >
      <ModalContent>
        {(onClose) => (
          <div className="text-white bg-neutral-600 rounded-xl">
            <ModalHeader>
              <div className="w-full text-xl sm:text-2xl md:text-3xl font-bold text-center text-red-500">
                Inscribir Trabajador
              </div>
            </ModalHeader>

            <ModalBody className="space-y-3 sm:space-y-4 max-h-[70vh] overflow-y-auto px-3 sm:px-6">
              {/* Alerta */}
              {alerta.show && (
                <div className="mb-4">
                  <Alert
                    color={alerta.color}
                    title={alerta.message}
                    variant="faded"
                    className="shadow-lg"
                    isClosable
                    onClose={() => setAlerta({ show: false, color: "default", message: "" })}
                  />
                </div>
              )}

              {/* Tipo de Documento */}
              <div>
                <label className="block mb-2 text-xs sm:text-sm">Tipo de Documento (Opcional)</label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setTipoDocumento("DNI");
                      setNumeroDocumento("");
                      setOrigenNombre("reniec");
                    }}
                    className={`flex-1 p-3 rounded-lg text-white transition-all duration-200 ${
                      tipoDocumento === "DNI"
                        ? "bg-red-600 ring-4 ring-red-400"
                        : "bg-gray-700 hover:bg-gray-600"
                    }`}
                    disabled={isLoading}
                  >
                    DNI
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setTipoDocumento("CE");
                      setNumeroDocumento("");
                      setOrigenNombre("manual");
                    }}
                    className={`flex-1 p-3 rounded-lg text-white transition-all duration-200 ${
                      tipoDocumento === "CE"
                        ? "bg-red-600 ring-4 ring-red-400"
                        : "bg-gray-700 hover:bg-gray-600"
                    }`}
                    disabled={isLoading}
                  >
                    CE
                  </button>
                </div>
              </div>

              {/* Origen para completar el nombre - Solo para DNI */}
              {tipoDocumento === "DNI" && (
                <div>
                  <label className="block mb-2 text-xs sm:text-sm">Origen del nombre</label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setOrigenNombre('reniec')}
                      className={`flex-1 p-2 rounded text-white transition-all ${
                        origenNombre === 'reniec'
                          ? "bg-red-600 ring-4 ring-red-400"
                          : "bg-gray-700 hover:bg-gray-600"
                      }`}
                      disabled={isLoading}
                    >
                      Consultar RENIEC
                    </button>
                    <button
                      type="button"
                      onClick={() => setOrigenNombre('manual')}
                      className={`flex-1 p-2 rounded text-white transition-all ${
                        origenNombre === 'manual'
                          ? "bg-red-600 ring-4 ring-red-400"
                          : "bg-gray-700 hover:bg-gray-600"
                      }`}
                      disabled={isLoading}
                    >
                      Manual
                    </button>
                  </div>
                  {origenNombre === 'reniec' && (
                    <span className="block mt-2 text-xs text-gray-300">La app consultará RENIEC al completar 8 dígitos.</span>
                  )}
                </div>
              )}

              {/* Número de Documento */}
              <Input
                label={`${tipoDocumento} (Opcional)`}
                placeholder={tipoDocumento === "DNI" ? "Ej. 12345678" : "Ej. 123456789"}
                value={numeroDocumento}
                onChange={(e) => {
                  const soloNumeros = e.target.value.replace(/\D/g, "");
                  if (tipoDocumento === "DNI") {
                    setNumeroDocumento(soloNumeros.slice(0, 8));
                  } else {
                    setNumeroDocumento(soloNumeros.slice(0, 12));
                  }
                }}
                disabled={isLoading}
                endContent={
                  isDniLoading && tipoDocumento === "DNI" && numeroDocumento.length === 8 ? (
                    <div className="flex items-center">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  ) : null
                }
              />

              {/* Nombre y Apellido */}
              <Input
                label="Nombre y Apellido"
                placeholder="Ej. Favio Alexander Coronado Zapata"
                value={nombreCompleto}
                onChange={(e) => {
                  const valor = e.target.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, "");
                  setNombreCompleto(valor);
                }}
                onBlur={(e) => {
                  const valorFormateado = formatearNombreInput(e.target.value);
                  setNombreCompleto(valorFormateado);
                }}
                disabled={isLoading}
              />

              {/* Nombre de usuario */}
              <Input
                label="Nombre de usuario"
                placeholder="Ingresa el nombre de usuario"
                value={usuario}
                onChange={(e) => {
                  setUsuario(e.target.value);
                }}
                disabled={isLoading}
              />

              {/* Contraseña */}
              <Input
                label="Contraseña"
                type={showPassword ? "text" : "password"}
                placeholder="Ingresa la contraseña"
                value={contrasena}
                onChange={(e) => setContrasena(e.target.value)}
                disabled={isLoading}
                endContent={
                  <button
                    className="focus:outline-none"
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <VisibilityOffIcon className="text-2xl pointer-events-none text-default-400" />
                    ) : (
                      <VisibilityIcon className="text-2xl pointer-events-none text-default-400" />
                    )}
                  </button>
                }
              />
            </ModalBody>

            <ModalFooter className="flex-col sm:flex-row gap-2 sm:gap-0">
              <Button
                color="danger"
                variant="light"
                onPress={() => {
                  handleClose();
                  onClose();
                }}
                className="w-full sm:w-auto text-white border-white"
                disabled={isLoading}
              >
                Cerrar
              </Button>
              <Button
                color="primary"
                onPress={inscribirTrabajador}
                className="w-full sm:w-auto text-white bg-red-600 hover:bg-red-700"
                disabled={isLoading}
                isLoading={isLoading}
              >
                {isLoading ? "Guardando..." : "Guardar"}
              </Button>
            </ModalFooter>
          </div>
        )}
      </ModalContent>
    </Modal>
  );
};

export default ModalInscribirTrab;