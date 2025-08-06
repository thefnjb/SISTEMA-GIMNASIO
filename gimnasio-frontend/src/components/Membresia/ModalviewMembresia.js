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
import DeleteIcon from "@mui/icons-material/Delete"; // ✅ Ícono de eliminar importado

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
      className="text-white bg-black"
    >
      <ModalContent>
        {(modalClose) => (
          <>
            <ModalHeader>
              <div className="w-full text-2xl font-bold text-center text-red-500">
                Membresías
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
                <div className="space-y-4 max-h-[400px] overflow-y-auto">
                  {(() => {
                    const groupedByMonth = data.reduce((acc, m) => {
                      const date = new Date(m.createdAt || m.fechaCreacion || Date.now());
                      const monthYear = date.toLocaleDateString("es-ES", {
                        month: "long",
                        year: "numeric",
                      });

                      if (!acc[monthYear]) {
                        acc[monthYear] = [];
                      }
                      acc[monthYear].push(m);
                      return acc;
                    }, {});

                    const sortedMonths = Object.keys(groupedByMonth).sort((a, b) => {
                      const dateA = new Date(groupedByMonth[a][0].createdAt || Date.now());
                      const dateB = new Date(groupedByMonth[b][0].createdAt || Date.now());
                      return dateB - dateA;
                    });

                    return sortedMonths.map((monthYear) => (
                      <div key={monthYear} className="space-y-2">
                        <h3 className="text-red-400 font-semibold text-lg capitalize border-b border-gray-600 pb-1">
                          {monthYear}
                        </h3>
                        <div className="space-y-2">
                          {groupedByMonth[monthYear].map((m) => (
                            <div
                              key={m._id}
                              className="bg-gray-700 rounded-lg p-3 flex justify-between items-center hover:bg-gray-600 transition-colors"
                            >
                              <div className="flex flex-col">
                                <span className="text-white font-medium">{m.titulo}</span>
                                <span className="text-green-400 font-semibold">
                                  S/ {Number(m.precio).toFixed(2)}
                                </span>
                                {m.duracion && (
                                  <span className="text-gray-300 text-sm">
                                    Duración: {m.duracion}
                                  </span>
                                )}
                              </div>
                              <Button
                                onPress={() => handleEliminar(m._id)}
                                className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
                                variant="light"
                                size="sm"
                                startContent={<DeleteIcon />} // ✅ Uso del ícono aquí
                              >
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    ));
                  })()}
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
