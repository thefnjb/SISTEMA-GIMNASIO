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
} from "@heroui/react";
import axios from "axios";

const Membresia = ({ onClose }) => {
  const { isOpen, onOpenChange } = useDisclosure({ defaultOpen: true });
  const [duracion, setDuracion] = useState("");
  const [precio, setPrecio] = useState("");
  const [turno, setTurno] = useState("");
  const [loading, setLoading] = useState(false);

  // precios automáticos por turno
  const preciosPorTurno = {
    mañana: 80,
    tarde: 100,
    noche: 120,
  };

  useEffect(() => {
    if (!isOpen && onClose) onClose();
  }, [isOpen, onClose]);

  // cuando cambie el turno, asignamos precio automáticamente
  useEffect(() => {
    if (turno && preciosPorTurno[turno]) {
      setPrecio(preciosPorTurno[turno].toString());
    }
  }, [turno]);

  const handleGuardar = async (modalClose) => {
    if (!duracion || isNaN(duracion) || Number(duracion) <= 0)
      return alert("La duración debe ser un número positivo.");
    if (!precio || isNaN(precio) || Number(precio) < 0)
      return alert("Precio inválido");
    if (!turno) return alert("Debes seleccionar un turno.");

    setLoading(true);

    try {
      const response = await axios.post(
        "http://localhost:4000/plans/nuevamembresia",
        {
          duracion: Number(duracion),
          precio: Number(precio),
          turno,
        },
        {
          withCredentials: true,
          headers: { "Content-Type": "application/json" },
        }
      );

      alert(response.data.message || "Membresía guardada correctamente");
      setDuracion("");
      setPrecio("");
      setTurno("");
      modalClose();
    } catch (err) {
      console.error("Error:", err);
      const msg =
        err.response?.data?.error || "Error al guardar. Verifica el servidor.";
      alert(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
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
              <Input
                label="Duración (en meses)"
                placeholder="Ej. 1, 3, 6, 12"
                type="number"
                value={duracion}
                onChange={(e) => setDuracion(e.target.value)}
                className="text-black"
                isRequired
                min="1"
                description="Para un año, ingresa 12."
              />

              <Select
                label="Turno"
                placeholder="Selecciona un turno"
                selectedKeys={turno ? [turno] : []}
                onSelectionChange={(keys) => setTurno([...keys][0])}
                className="text-black"
                isRequired
              >
                <SelectItem key="mañana">Mañana - S/80</SelectItem>
                <SelectItem key="tarde">Tarde - S/100</SelectItem>
                <SelectItem key="noche">Noche - S/120</SelectItem>
              </Select>

              <Input
                label="Precio"
                placeholder="Ej. 100"
                type="number"
                value={precio}
                onChange={(e) => setPrecio(e.target.value)}
                className="text-black"
                isRequired
              />
            </ModalBody>

            <ModalFooter>
              <Button
                color="danger"
                variant="light"
                onPress={modalClose}
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
  );
};

export default Membresia;
