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
import { useState } from "react";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import api from "../../utils/axiosInstance";

const ModalInscribirTrab = ({ isOpen, onClose }) => {
  const [nombreCompleto, setNombreCompleto] = useState("");
  const [usuario, setUsuario] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false); 

  const [alerta, setAlerta] = useState({ show: false, color: "default", message: "" });

  const mostrarAlerta = (color, message, duration = 3000) => {
    setAlerta({ show: true, color, message });
    setTimeout(() => {
      setAlerta({ show: false, color: "default", message: "" });
    }, duration);
  };

  const handleClose = () => {
    setNombreCompleto("");
    setUsuario("");
    setContrasena("");
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
      className="text-white bg-black"
    >
      <ModalContent>
        <div className="text-white bg-neutral-800 rounded-xl">
          <ModalHeader>
            <div className="w-full text-3xl font-bold text-center text-red-500">
              Inscribir Trabajador
            </div>
          </ModalHeader>

          <ModalBody className="py-6 space-y-4">
            {alerta.show && <Alert color={alerta.color} title={alerta.message} />}

            <>
                <Input
                  label="Nombre y Apellido"
                  placeholder="Ej. Favio Alexander Coronado Zapata "
                  value={nombreCompleto}
                    onChange={(e) => {
                    const valor = e.target.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, "");
                    setNombreCompleto(valor);
                  }}
                />
              <Input
                label="Nombre de usuario"
                placeholder="Ingresa el nombre de usuario"
                value={usuario}
                onChange={(e) => {
                  const valor = e.target.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, "");
                    setNombreCompleto(valor);
                  }}
              />
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
            </>
          </ModalBody>

          <ModalFooter>
            <>
              <Button
                onPress={handleClose}
                className="text-gray-300 bg-transparent border border-neutral-600 hover:bg-neutral-700"
                disabled={isLoading}
              >
                Cancelar
              </Button>
              <Button
                className="text-white bg-red-600 hover:bg-red-700"
                onPress={inscribirTrabajador}
                disabled={isLoading}
                isLoading={isLoading}
              >
                {isLoading ? "Guardando..." : "Guardar"}
              </Button>
            </>
          </ModalFooter>
        </div>
      </ModalContent>
    </Modal>
  );
};

export default ModalInscribirTrab;