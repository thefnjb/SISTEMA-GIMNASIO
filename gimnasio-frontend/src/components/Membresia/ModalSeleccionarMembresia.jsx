import React, { useEffect, useState } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Spinner,
} from "@heroui/react";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
} from "@nextui-org/react";
import api from "../../utils/axiosInstance";

const ModalSeleccionarMembresia = ({ isOpen, onOpenChange, onSeleccionar }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMembresias = async () => {
      if (!isOpen) return;
      
      console.log("🔍 Iniciando petición de membresías...");
      console.log("🔍 URL base de API:", api.defaults.baseURL);
      
      setLoading(true);
      setError(null);
      
      try {
        console.log("🔍 Haciendo petición a /plans/vermembresia");
        
        const response = await api.get("/plans/vermembresia", {
          withCredentials: true,
        });
        
        console.log("✅ Respuesta recibida:", response);
        console.log("✅ Status:", response.status);
        console.log("✅ Datos:", response.data);
        console.log("✅ Cantidad de membresías:", response.data.length);
        
        setData(response.data);
        
      } catch (err) {
        console.error("❌ Error completo:", err);
        console.error("❌ Error response:", err.response);
        console.error("❌ Error status:", err.response?.status);
        console.error("❌ Error data:", err.response?.data);
        console.error("❌ Error message:", err.message);
        
        setError(`Error al cargar las membresías: ${err.response?.status || err.message}`);
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
      size={{ base: "full", sm: "xl", md: "2xl" }}
      className="text-white bg-black"
      scrollBehavior="inside"
    >
      <ModalContent>
        {(modalClose) => (
          <>
            <ModalHeader>
              <div className="w-full text-xl sm:text-2xl font-bold text-center text-red-500">
                Seleccionar Membresía
              </div>
            </ModalHeader>

            <ModalBody className="space-y-3 sm:space-y-4 px-2 sm:px-6">
              {loading ? (
                <div className="flex items-center justify-center py-6">
                  <Spinner size="lg" color="default" />
                  <span className="ml-3 text-white">Cargando...</span>
                </div>
              ) : error ? (
                <div className="py-4 text-center text-red-400">{error}</div>
              ) : data.length > 0 ? (
                <div className="w-full overflow-x-auto max-h-[400px] overflow-y-auto">
                  {/* Vista de tabla para desktop */}
                  <Table
                    aria-label="Tabla de membresías"
                    removeWrapper
                    classNames={{
                      base: "hidden md:block",
                      table: "bg-gray-800 text-white",
                      th: "bg-gray-900 text-red-500 font-bold text-xs sm:text-sm px-2 sm:px-4 py-2",
                      td: "text-white text-xs sm:text-sm px-2 sm:px-4 py-2",
                      tr: "hover:bg-gray-700 cursor-pointer transition-colors",
                    }}
                  >
                    <TableHeader>
                      <TableColumn className="min-w-[120px]">DURACIÓN</TableColumn>
                      <TableColumn className="min-w-[100px] text-right">PRECIO</TableColumn>
                    </TableHeader>
                    <TableBody>
                      {data.map((m) => (
                        <TableRow
                          key={m._id}
                          onClick={() => onSeleccionar(m)}
                        >
                          <TableCell>
                            <span className="font-medium">
                              {m.duracion === 12 ? "1 Año" : `${m.duracion} Mes${m.duracion > 1 ? 'es' : ''}`}
                            </span>
                          </TableCell>
                          <TableCell className="text-right">
                            <span className="font-semibold text-green-400">
                              S/ {Number(m.precio).toFixed(2)}
                            </span>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>

                  {/* Vista de cards para móvil */}
                  <div className="md:hidden space-y-3">
                    {data.map((m) => (
                      <div
                        key={m._id}
                        onClick={() => onSeleccionar(m)}
                        className="flex items-center justify-between p-4 transition-all duration-200 bg-gray-700 rounded-lg cursor-pointer hover:bg-gray-600 active:scale-95"
                      >
                        <div className="flex flex-col gap-1">
                          <span className="text-sm font-medium text-white">
                            {m.duracion === 12 ? "1 Año" : `${m.duracion} Mes${m.duracion > 1 ? 'es' : ''}`}
                          </span>
                          <span className="text-base font-semibold text-green-400">
                            S/ {Number(m.precio).toFixed(2)}
                          </span>
                        </div>
                        <div className="text-white text-lg">→</div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-center text-gray-400">No hay membresías para seleccionar.</p>
              )}
            </ModalBody>

            <ModalFooter className="flex-col sm:flex-row gap-2 sm:gap-0">
              <Button
                onPress={modalClose}
                className="w-full sm:w-auto text-white border-white"
                variant="light"
                color="danger"
              >
                Cancelar
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

export default ModalSeleccionarMembresia;