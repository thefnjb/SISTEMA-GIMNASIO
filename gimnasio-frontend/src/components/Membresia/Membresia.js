import React, { useEffect, useState } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  useDisclosure,
  Input,
  Select,
  SelectItem,
  Alert,
} from "@heroui/react";
import axios from "axios";

const preciosPorTurno = {
  mañana: 80,
  tarde: 100,
  noche: 120,
};

const Membresia = ({ onClose }) => {
  const { isOpen, onOpenChange } = useDisclosure({ defaultOpen: true });
  const [duracion, setDuracion] = useState("");
  const [precio, setPrecio] = useState("");
  const [turno, setTurno] = useState("");
  const [loading, setLoading] = useState(false);

  // 🚨 Estados para alertas
  const [alertaInterna, setAlertaInterna] = useState({ show: false, type: "", message: "", title: "" });

  useEffect(() => {
    if (!isOpen && onClose) onClose();
  }, [isOpen, onClose]);

  useEffect(() => {
    if (turno && preciosPorTurno[turno]) {
      setPrecio(preciosPorTurno[turno].toString());
    }
  }, [turno]);

  const mostrarAlertaInterna = (type, title, message) => {
    setAlertaInterna({ show: true, type, title, message });
    setTimeout(() => setAlertaInterna({ show: false, type: "", message: "", title: "" }), 4000);
  };

  const limpiarCampos = () => {
    setDuracion("");
    setPrecio("");
    setTurno("");
    setAlertaInterna({ show: false, type: "", message: "", title: "" });
  };

  const handleGuardar = async (modalClose) => {
    if (!duracion || isNaN(duracion) || Number(duracion) <= 0) {
      return mostrarAlertaInterna("warning", "Duración inválida", "La duración debe ser un número positivo");
    }
    if (!precio || isNaN(precio) || Number(precio) < 0) {
      return mostrarAlertaInterna("warning", "Precio inválido", "El precio debe ser un número válido mayor o igual a 0");
    }
    if (!turno) {
      return mostrarAlertaInterna("warning", "Turno requerido", "Debes seleccionar un turno");
    }
    if (Number(duracion) > 24) {
      return mostrarAlertaInterna("warning", "Duración excesiva", "La duración no puede ser mayor a 24 meses");
    }
    if (Number(precio) > 1000) {
      return mostrarAlertaInterna("warning", "Precio excesivo", "El precio no puede ser mayor a S/ 1000");
    }

    setLoading(true);
    try {
      const response = await axios.post("http://localhost:4000/plans/nuevamembresia", {
        duracion: Number(duracion),
        precio: Number(precio),
        turno,
      }, {
        withCredentials: true,
        headers: { "Content-Type": "application/json" },
      });

      const mensaje = response.data.message || "Membresía guardada correctamente";
      mostrarAlertaInterna("success", "¡Éxito!", mensaje);

      setTimeout(() => {
        limpiarCampos();
        modalClose();
      }, 1500);

    } catch (err) {
      const mensaje = err.response?.data?.error || "Error al guardar. Verifica el servidor.";
      if (err?.response?.status === 409) {
        mostrarAlertaInterna("warning", "Membresía duplicada", mensaje);
      } else if (err?.response?.status === 400) {
        mostrarAlertaInterna("warning", "Datos inválidos", mensaje);
      } else if (err?.response?.status === 500) {
        mostrarAlertaInterna("danger", "Error del servidor", mensaje);
      } else {
        mostrarAlertaInterna("danger", "Error de conexión", "No se pudo conectar con el servidor");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        backdrop="blur"
        isDismissable={false}
        className="text-white bg-black"
      >
        <ModalContent>
          {(modalClose) => (
            <div className="text-white bg-neutral-600 rounded-xl">
              <ModalHeader>
                <div className="w-full text-3xl font-bold text-center text-red-500">
                  Agregar Nueva Membresía
                </div>
              </ModalHeader>

              <ModalBody className="space-y-4">
                {/* 🚨 ALERTA INTERNA */}
                {alertaInterna.show && (
                  <div className="mb-4">
                    <Alert
                      color={alertaInterna.type}
                      title={alertaInterna.title}
                      description={alertaInterna.message}
                      variant="faded"
                      className="shadow-lg"
                    />
                  </div>
                )}

                <Input
                  label="Duración (en meses)"
                  placeholder="Ej. 1, 3, 6, 12"
                  type="number"
                  value={duracion}
                  onChange={(e) => setDuracion(e.target.value)}
                  className="text-black"
                  isRequired
                  min="1"
                  max="24"
                  description="Para un año, ingresa 12. Máximo 24 meses."
                />

                <Select
                  label="Turno"
                  placeholder="Selecciona un turno"
                  value={turno}
                  onChange={(e) => setTurno(e.target.value)}
                  className="text-black"
                  isRequired
                >
                  <SelectItem key="mañana" value="mañana">Mañana - S/80</SelectItem>
                  <SelectItem key="tarde" value="tarde">Tarde - S/100</SelectItem>
                  <SelectItem key="noche" value="noche">Noche - S/120</SelectItem>
                </Select>

                <Input
                  label="Precio"
                  placeholder="Ej. 100"
                  type="number"
                  value={precio}
                  onChange={(e) => setPrecio(e.target.value)}
                  className="text-black"
                  isRequired
                  min="0"
                  max="1000"
                  description="Se asigna automáticamente según el turno seleccionado."
                />
              </ModalBody>

              <ModalFooter>
                <Button
                  color="danger"
                  variant="light"
                  onPress={() => {
                    limpiarCampos();
                    modalClose();
                  }}
                  isDisabled={loading}
                  className="text-white border-white"
                >
                  Cancelar
                </Button>
                <Button
                  className="text-white bg-red-600 hover:bg-red-700"
                  onPress={() => handleGuardar(modalClose)}
                  isLoading={loading}
                  isDisabled={loading}
                >
                  {loading ? "Guardando..." : "Guardar"}
                </Button>
              </ModalFooter>
            </div>
          )}
        </ModalContent>
      </Modal>
    </>
  );
};

export default Membresia;