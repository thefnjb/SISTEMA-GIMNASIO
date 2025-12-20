import { useState} from "react";
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
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";

export default function ModalEditarTrabajador({ trabajador, onClose, onUpdate }) {
  const [nombre, setNombre] = useState(trabajador?.nombre || "");
  const [tipoDocumento, setTipoDocumento] = useState(trabajador?.tipoDocumento || "DNI");
  const [numeroDocumento, setNumeroDocumento] = useState(trabajador?.numeroDocumento || "");
  const [nombreUsuario, setNombreUsuario] = useState(trabajador?.nombreUsuario || "");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [alerta, setAlerta] = useState({ show: false, color: "default", message: "" });
  const [showPassword, setShowPassword] = useState(false); 

  if (!trabajador) return null;

  const mostrarAlerta = (color, message, duration = 3000) => {
    setAlerta({ show: true, color, message });
    setTimeout(() => {
      setAlerta({ show: false, color: "default", message: "" });
    }, duration);
  };

  const handleClose = () => {
    setNombre("");
    setTipoDocumento("DNI");
    setNumeroDocumento("");
    setNombreUsuario("");
    setPassword("");
    setAlerta({ show: false, color: "default", message: "" });
    setShowPassword(false); // Reset showPassword on close
    onClose();
  };

  const handleGuardar = async () => {
    if (!nombre.trim()) {
      mostrarAlerta("warning", "El nombre no puede estar vacío.");
      return;
    }
    if (!nombreUsuario.trim()) {
      mostrarAlerta("warning", "El nombre de usuario no puede estar vacío.");
      return;
    }

    setIsLoading(true);
    try {
      await onUpdate(trabajador._id, {
        nombre,
        tipoDocumento: tipoDocumento || undefined,
        numeroDocumento: numeroDocumento.trim() || undefined,
        nombreUsuario,
        ...(password && { password }),
      });

      mostrarAlerta("success", "Trabajador actualizado correctamente.", 2000);
      setIsLoading(false); 

      setTimeout(() => {
        handleClose();
      }, 2000);
    } catch (err) {
      console.error("Error al actualizar trabajador:", err);
      mostrarAlerta("danger", "Error al actualizar trabajador.");
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={!!trabajador}
      onOpenChange={handleClose}
      hideCloseButton
      backdrop="blur"
      isDismissable={!isLoading}
      className="text-white bg-black"
    >
      <ModalContent>
        <div className="text-white bg-neutral-800 rounded-xl">
          <ModalHeader>
            <div className="w-full text-3xl font-bold text-center text-color-acentos">
              Editar Trabajador
            </div>
          </ModalHeader>

          <ModalBody className="py-6 space-y-4">
            {alerta.show && <Alert color={alerta.color} title={alerta.message} />}

            <Input
              label="Nombre y Apellido"
              placeholder="Ej. Favio Alexander Coronado Zapata "
              value={nombre}
              onChange={(e) => {
                const valor = e.target.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, "");
                setNombre(valor);
              }}
            />
            
            {/* Tipo de Documento */}
            <div>
              <label className="block mb-2 text-sm text-gray-300">Tipo de Documento</label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setTipoDocumento("DNI");
                    setNumeroDocumento("");
                  }}
                  className={`flex-1 p-2 rounded text-white transition-all ${
                    tipoDocumento === "DNI"
                      ? "bg-color-botones ring-2 ring-color-acentos"
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
                  }}
                  className={`flex-1 p-2 rounded text-white transition-all ${
                    tipoDocumento === "CE"
                      ? "bg-color-botones ring-2 ring-color-acentos"
                      : "bg-gray-700 hover:bg-gray-600"
                  }`}
                  disabled={isLoading}
                >
                  CE
                </button>
              </div>
            </div>

            {/* Número de Documento */}
            <Input
              label={`${tipoDocumento}`}
              placeholder={tipoDocumento === "DNI" ? "Ej. 75362380" : "Ej. 753623801"}
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
            />

            <Input
              label="Nombre de usuario"
              placeholder="Escribe el nombre de usuario"
              value={nombreUsuario}
              onChange={(e) => {
                setNombreUsuario(e.target.value);
              }}
              disabled={isLoading}
            />
            <Input
              label="Nueva contraseña (opcional)"
              placeholder="Deja en blanco para no cambiar"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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

          <ModalFooter>
            <Button
              onPress={handleClose}
              className="text-gray-300 bg-transparent border border-neutral-600 hover:bg-neutral-700"
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button
              className="text-white bg-color-botones"
              onPress={handleGuardar}
              disabled={isLoading}
              isLoading={isLoading}
            >
              {isLoading ? "Guardando..." : "Guardar"}
            </Button>
          </ModalFooter>
        </div>
      </ModalContent>
    </Modal>
  );
}
