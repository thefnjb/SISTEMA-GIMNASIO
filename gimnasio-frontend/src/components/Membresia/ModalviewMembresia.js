import React, { useEffect, useState } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  useDisclosure,
  Spinner,
  Alert,
} from "@heroui/react";
import axios from "axios";
import DeleteIcon from "@mui/icons-material/Delete";

const ModalviewMembresia = ({ onClose }) => {
  const { isOpen, onOpenChange } = useDisclosure({ defaultOpen: true });
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [alerta, setAlerta] = useState({ show: false, type: "", message: "", title: "" });

  useEffect(() => {
    if (!isOpen && onClose) onClose();
  }, [isOpen, onClose]);

  const mostrarAlerta = (type, title, message) => {
    setAlerta({ show: true, type, title, message });
    setTimeout(() => setAlerta({ show: false, type: "", message: "", title: "" }), 4000);
  };

  // Traer membresías
  useEffect(() => {
    const fetchMembresias = async () => {
      if (!isOpen) return;
      setLoading(true);
      setError(null);
      try {
        const response = await axios.get("http://localhost:4000/plans/vermembresia", {
          withCredentials: true,
          timeout: 10000,
        });
        setData(response.data);
      } catch (err) {
        if (err.response) {
          setError(`Error del servidor: ${err.response.data.error || err.response.statusText}`);
        } else if (err.request) {
          setError("Error de conexión con el servidor");
        } else {
          setError("Error desconocido");
        }
      } finally {
        setLoading(false);
      }
    };
    fetchMembresias();
  }, [isOpen]);

  // Eliminar membresía
  const handleEliminar = async id => {
    try {
      await axios.delete(`http://localhost:4000/plans/eliminarmembresia/${id}`, {
        withCredentials: true,
      });
      setData(prev => prev.filter(m => m._id !== id));
      mostrarAlerta("success", "¡Éxito!", "Membresía eliminada correctamente.");
    } catch (err) {
      mostrarAlerta("danger", "Error", "Error al eliminar la membresía.");
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      hideCloseButton
      backdrop="blur"
      isDismissable={false}
      className="text-white bg-black"
    >
      <ModalContent>
        {modalClose => (
          <>
            <ModalHeader>
              <div className="w-full text-2xl font-bold text-center text-red-500">
                Membresías
              </div>
            </ModalHeader>

            <ModalBody className="space-y-4">
              {alerta.show && (
                <div className="mb-4">
                  <Alert
                    color={alerta.type}
                    title={alerta.title}
                    description={alerta.message}
                    variant="faded"
                    className="shadow-lg"
                  />
                </div>
              )}

              {/* Lista de Membresías */}
              {loading ? (
                <div className="flex items-center justify-center py-6">
                  <Spinner size="lg" color="default" />
                  <span className="ml-3 text-white">Cargando...</span>
                </div>
              ) : error ? (
                <div className="py-4 text-center text-red-400">{error}</div>
              ) : data.length > 0 ? (
                <div className="space-y-4 max-h-[400px] overflow-y-auto">
                  {data.map(m => (
                    <div
                      key={m._id}
                      className="flex items-center justify-between p-3 transition-colors bg-gray-700 rounded-lg hover:bg-gray-600"
                    >
                      <div className="flex flex-col">
                        <span className="font-medium text-white">
                          {m.duracion === 12
                            ? "1 Año"
                            : `${m.duracion} Mes${m.duracion > 1 ? "es" : ""}`}
                        </span>
                        <span className="text-gray-300">Turno: {m.turno}</span>
                        <span className="font-semibold text-green-400">
                          S/ {Number(m.precio).toFixed(2)}
                        </span>
                      </div>
                      <Button
                        onPress={() => handleEliminar(m._id)}
                        className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
                        variant="light"
                        size="sm"
                        startContent={<DeleteIcon />}
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-400">No hay membresías registradas.</p>
              )}
            </ModalBody>

            <ModalFooter>
              <Button
                onPress={modalClose}
                className="text-white border-white"
                variant="light"
                color="danger"
              >
                Cerrar
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

export default ModalviewMembresia;