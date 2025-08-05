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
} from "@heroui/react";
import axios from "axios";

const ModalviewMembresia = ({ onClose }) => {
  const { isOpen, onOpenChange } = useDisclosure({ defaultOpen: true });
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isOpen && onClose) onClose();
  }, [isOpen, onClose]);

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

  const handleEliminar = async (id) => {
    if (!window.confirm("¿Estás seguro de eliminar esta membresía?")) return;
    try {
      await axios.delete(`http://localhost:4000/plans/eliminarmembresia/${id}`, {
        withCredentials: true,
      });
      setData((prev) => prev.filter((m) => m._id !== id));
    } catch (err) {
      alert("Error al eliminar membresía");
    }
  };

  const handleRefresh = async () => {
    setLoading(true);
    try {
      const response = await axios.get("http://localhost:4000/plans/vermembresia", {
        withCredentials: true,
      });
      setData(response.data);
    } catch (err) {
      setError("No se pudieron recargar las membresías.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      hideCloseButton
      backdrop="blur"
      isDismissable={false}
      className="bg-black text-white"
    >
      <ModalContent>
        {(modalClose) => (
          <div className="bg-neutral-600 rounded-xl text-white">
            <ModalHeader className="flex justify-between items-center">
              <div className="w-full text-center text-red-500 text-3xl font-bold">
                Membresías
              </div>
              <div className="flex-shrink-0">
                <Button
                  className="text-white border border-white"
                  variant="light"
                  size="sm"
                  onPress={handleRefresh}
                  isDisabled={loading}
                >
                  Actualizar
                </Button>
              </div>
            </ModalHeader>

            <ModalBody className="space-y-4">
              {loading ? (
                <div className="flex justify-center items-center py-6">
                  <Spinner size="lg" color="default" />
                  <span className="ml-3 text-white">Cargando...</span>
                </div>
              ) : error ? (
                <div className="text-center py-4 text-red-400">{error}</div>
              ) : data.length > 0 ? (
                <ul className="bg-white text-black rounded-lg p-3 space-y-2 max-h-[300px] overflow-y-auto">
                  {data.map((m) => (
                    <li
                      key={m._id}
                      className="flex justify-between items-center px-2 py-1 rounded-md hover:bg-red-100"
                    >
                      <span>
                        {m.titulo} — S/ {Number(m.precio).toFixed(2)}
                      </span>
                      <Button
                        onPress={() => handleEliminar(m._id)}
                        className="text-red-500 hover:text-red-700"
                        variant="light"
                        size="sm"
                      >
                        Eliminar
                      </Button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-center text-gray-200">No hay membresías registradas.</p>
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
          </div>
        )}
      </ModalContent>
    </Modal>
  );
};

export default ModalviewMembresia;
