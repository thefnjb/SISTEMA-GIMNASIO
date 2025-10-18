import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  useDisclosure,
  User,
} from "@heroui/react";
import { useEffect, useState } from "react";
import api from "../../utils/axiosInstance";

const esNombreFemenino = (nombre) => {
  if (!nombre) return false;
  const nombreLower = nombre.toLowerCase();
  return nombreLower.endsWith("a");
};

const ModalviewDia = ({
  triggerText = "Ver Clientes del Día",
  title = "Clientes Registrados",
}) => {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [clientes, setClientes] = useState([]);

  const fetchClientes = async () => {
    try {
      const res = await api.get("/visits/clientesdia", {
        withCredentials: true,
      });
      setClientes(res.data);
    } catch (err) {
      console.error("Error al obtener clientes:", err.response || err.message || err);
      alert("Ocurrió un error al cargar los clientes.");
    }
  };

  useEffect(() => {
    if (isOpen) fetchClientes();
  }, [isOpen]);

  return (
    <>
      <Button
        onPress={onOpen}
        className="text-white transition-all"
        style={{ backgroundColor: "#7a0f16" }}
      >
        {triggerText}
      </Button>

      <Modal
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        hideCloseButton
        backdrop="blur"
        isDismissable={false}
        className="text-white bg-black"
      >
        <ModalContent>
          {(onClose) => (
            <div className="text-white bg-neutral-600 rounded-xl">
              <ModalHeader>
                <div className="w-full text-3xl font-bold text-left text-red-500">
                  {title}
                </div>
              </ModalHeader>

              <ModalBody className="space-y-4 max-h-[400px] overflow-y-auto">
                {clientes.length > 0 ? (
                  <ul className="space-y-3">
                    {clientes.map((cliente, index) => (
                      <li
                        key={index}
                        className="flex flex-col w-full p-3 text-black transition bg-white rounded-md shadow hover:shadow-red-400/20"
                      >
                        <User
                          className="justify-start w-full gap-2 text-left"
                          avatarProps={{
                            src: esNombreFemenino(cliente.nombre)
                              ? "/iconos/mujer.png"
                              : "/iconos/chico.png",
                          }}
                          name={cliente.nombre}
                          description={
                            <div className="space-y-1">
                              <div className="text-sm">
                                Pago: {cliente.metododePago}
                              </div>
                              <div className="text-sm">
                                Fecha:{" "}
                                {new Date(cliente.fecha).toLocaleDateString()}
                              </div>
                            </div>
                          }
                        />
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-left">No hay clientes registrados aún.</p>
                )}
              </ModalBody>

              <ModalFooter className="justify-start">
                <Button
                  color="danger"
                  variant="light"
                  onPress={onClose}
                  className="text-white border-white"
                >
                  Cerrar
                </Button>
              </ModalFooter>
            </div>
          )}
        </ModalContent>
      </Modal>
    </>
  );
};

export default ModalviewDia;
