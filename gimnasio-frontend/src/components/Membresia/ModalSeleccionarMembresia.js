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
      className="text-white bg-black"
    >
      <ModalContent>
        {(modalClose) => (
          <>
            <ModalHeader>
              <div className="w-full text-2xl font-bold text-center text-red-500">
                Seleccionar Membresía
              </div>
            </ModalHeader>

            <ModalBody className="space-y-4">
              {loading ? (
                <div className="flex items-center justify-center py-6">
                  <Spinner size="lg" color="default" />
                  <span className="ml-3 text-white">Cargando...</span>
                </div>
              ) : error ? (
                <div className="py-4 text-center text-red-400">{error}</div>
              ) : data.length > 0 ? (
                <div className="space-y-4 max-h-[400px] overflow-y-auto">
                  {data.map((m) => (
                    <div
                      key={m._id}
                      onClick={() => onSeleccionar(m)}
                      className="flex items-center justify-between p-3 transition-colors bg-gray-700 rounded-lg cursor-pointer hover:bg-gray-600"
                    >
                      <div className="flex flex-col">
                        <span className="font-medium text-white">
                          {m.duracion === 12 ? "1 Año" : `${m.duracion} Mes${m.duracion > 1 ? 'es' : ''}`}
                        </span>
                        <span className="font-semibold text-green-400">
                          S/ {Number(m.precio).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-400">No hay membresías para seleccionar.</p>
              )}
            </ModalBody>

            <ModalFooter>
              <Button
                onPress={modalClose}
                className="text-white border-white"
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