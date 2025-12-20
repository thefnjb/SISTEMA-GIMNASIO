import React, { useEffect, useState } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  CircularProgress,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
} from "@heroui/react";
import api from "../../utils/axiosInstance";

const ModalSeleccionarMembresia = ({ isOpen, onOpenChange, onSeleccionar }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMembresias = async () => {
      if (!isOpen) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const response = await api.get("/plans/vermembresia", {
          withCredentials: true,
        });
        
        setData(response.data);
        
      } catch (err) {
        console.error("Error al cargar membresías:", err);
        setError(`Error al cargar las membresías: ${err.response?.data?.error || err.message || "Error desconocido"}`);
      } finally {
        setLoading(false);
      }
    };
    
    fetchMembresias();
  }, [isOpen]);

  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      hideCloseButton
      backdrop="blur"
      isDismissable={false}
      size={{ base: "full", sm: "lg", md: "xl" }}
      className="text-white bg-black"
      scrollBehavior="inside"
    >
      <ModalContent>
        {(modalClose) => (
          <div className="text-white bg-neutral-600 rounded-xl">
            <ModalHeader>
              <div className="w-full text-lg xs:text-xl sm:text-2xl font-bold text-center text-color-acentos px-2">
                Seleccionar Membresía
              </div>
            </ModalHeader>

            <ModalBody className="space-y-2 xs:space-y-3 sm:space-y-4 max-h-[70vh] overflow-y-auto px-2 xs:px-3 sm:px-6">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <CircularProgress size="lg" color="default" aria-label="Cargando..." />
                  <span className="ml-3 text-white">Cargando membresías...</span>
                </div>
              ) : error ? (
                <div className="py-4 text-center text-red-400 bg-red-900/20 rounded-lg p-4">
                  {error}
                </div>
              ) : data.length > 0 ? (
                <>
                  {/* Vista de tabla para desktop */}
                  <div className="hidden md:block w-full">
                    <div className="bg-gray-800 rounded-lg shadow overflow-hidden">
                      <Table
                        aria-label="Tabla de membresías"
                        removeWrapper
                        classNames={{
                          base: "bg-transparent",
                          wrapper: "bg-transparent",
                          th: "bg-gradient-tabla-header text-white font-bold text-xs sm:text-sm border-b border-gray-700",
                          td: "text-white text-xs sm:text-sm bg-gray-800 border-b border-gray-700",
                          tr: "hover:bg-gray-700 cursor-pointer transition-colors",
                        }}
                      >
                        <TableHeader>
                          <TableColumn className="min-w-[150px]">DURACIÓN</TableColumn>
                          <TableColumn className="min-w-[120px] text-right">PRECIO</TableColumn>
                        </TableHeader>
                        <TableBody items={data}>
                          {(m) => (
                            <TableRow
                              key={m._id}
                              onClick={() => onSeleccionar(m)}
                              className="bg-gray-800 hover:bg-gray-700"
                            >
                              <TableCell className="bg-gray-800">
                                <span className="font-medium text-white">
                                  {m.duracion === 12 ? "1 Año" : `${m.duracion} Mes${m.duracion > 1 ? 'es' : ''}`}
                                </span>
                              </TableCell>
                              <TableCell className="text-right bg-gray-800">
                                <span className="font-semibold text-green-400">
                                  S/ {Number(m.precio).toFixed(2)}
                                </span>
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  </div>

                  {/* Vista de cards para móvil */}
                  <div className="md:hidden space-y-2 xs:space-y-3">
                    {data.map((m) => (
                      <div
                        key={m._id}
                        onClick={() => onSeleccionar(m)}
                        className="flex items-center justify-between p-2 xs:p-3 sm:p-4 transition-all duration-200 bg-gray-700 rounded-lg cursor-pointer hover:bg-gray-600 active:scale-95 border border-gray-600"
                      >
                        <div className="flex flex-col gap-0.5 xs:gap-1 min-w-0 flex-1">
                          <span className="text-sm xs:text-base font-semibold text-white truncate">
                            {m.duracion === 12 ? "1 Año" : `${m.duracion} Mes${m.duracion > 1 ? 'es' : ''}`}
                          </span>
                          <span className="text-base xs:text-lg font-bold text-green-400">
                            S/ {Number(m.precio).toFixed(2)}
                          </span>
                        </div>
                        <div className="text-white text-lg xs:text-xl font-bold ml-2 flex-shrink-0">→</div>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="py-8 text-center">
                  <p className="text-gray-400 text-sm">No hay membresías disponibles para seleccionar.</p>
                </div>
              )}
            </ModalBody>

            <ModalFooter className="flex-col sm:flex-row gap-2 px-2 xs:px-4 sm:px-6">
              <Button
                onPress={modalClose}
                className="w-full sm:w-auto text-white border-white text-sm xs:text-base"
                variant="light"
                color="danger"
              >
                Cancelar
              </Button>
            </ModalFooter>
          </div>
        )}
      </ModalContent>
    </Modal>
  );
};

export default ModalSeleccionarMembresia;