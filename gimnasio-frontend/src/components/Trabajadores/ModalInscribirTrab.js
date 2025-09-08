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
import api from "../../utils/axiosInstance";
const ModalInscribirTrab = ({ isOpen, onClose }) => {
  const [nombreCompleto, setNombreCompleto] = useState("");
  const [usuario, setUsuario] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [alerta, setAlerta] = useState({ show: false, color: "default", message: "" });

  const mostrarAlerta = (color, message, duration = 3000) => {
    setAlerta({ show: true, color, message });
    setTimeout(() => {
      setAlerta({ show: false, color: "default", message: "" });
    }, duration);
  };

  // Función para limpiar el estado y cerrar el modal
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
      
      // Usamos la alerta para notificar éxito y luego cerramos.
      mostrarAlerta("success", "Trabajador inscrito correctamente.", 2000);
      
      setTimeout(() => {
        handleClose();
      }, 2000);

    } catch (err) {
      console.error("Error al inscribir trabajador:", err);
      const errorMessage = err.response?.data?.message || "Error al inscribir trabajador.";
      mostrarAlerta("danger", errorMessage);
    } finally {
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
            {alerta.show && (
              <Alert color={alerta.color} title={alerta.message} />
            )}

            <Input
              label="Nombre completo"
              placeholder="Ingresa el nombre completo"
              value={nombreCompleto}
              onChange={(e) => setNombreCompleto(e.target.value)}
              disabled={isLoading}
            />
            <Input
              label="Nombre de usuario"
              placeholder="Ingresa el nombre de usuario"
              value={usuario}
              onChange={(e) => setUsuario(e.target.value)}
              disabled={isLoading}
            />
            <Input
              label="Contraseña"
              type="password"
              placeholder="Ingresa la contraseña"
              value={contrasena}
              onChange={(e) => setContrasena(e.target.value)}
              disabled={isLoading}
            />
          </ModalBody>

          <ModalFooter>
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
              {isLoading ? 'Guardando...' : 'Guardar'}
            </Button>
          </ModalFooter>
        </div>
      </ModalContent>
    </Modal>
  );
};

export default ModalInscribirTrab;
