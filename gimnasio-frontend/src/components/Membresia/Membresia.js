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
} from "@heroui/react";
import axios from "axios";

const Membresia = ({ onClose }) => {
  const { isOpen, onOpenChange } = useDisclosure({ defaultOpen: true });
  const [duracion, setDuracion] = useState("");
  const [precio, setPrecio] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen && onClose) onClose();
  }, [isOpen, onClose]);

  const handleGuardar = async (modalClose) => {
    if (!duracion || isNaN(duracion) || Number(duracion) <= 0)
      return alert("La duración debe ser un número positivo.");
    if (!precio || isNaN(precio) || Number(precio) < 0)
      return alert("Precio inválido");

    setLoading(true);

    try {
      const response = await axios.post(
        "http://localhost:4000/plans/nuevamembresia",
        {
          duracion: Number(duracion),
          precio: Number(precio),
        },
        {
          withCredentials: true,
          headers: { "Content-Type": "application/json" },
        }
      );

      alert(response.data.message || "Membresía guardada correctamente");
      setDuracion("");
      setPrecio("");
      modalClose();
    } catch (err) {
      console.error("Error:", err);
      const msg =
        err.response?.data?.error ||
        "Error al guardar. Verifica el servidor.";
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
