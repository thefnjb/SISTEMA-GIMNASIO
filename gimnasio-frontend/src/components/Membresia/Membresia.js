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
  const [titulo, setTitulo] = useState("");
  const [precio, setPrecio] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen && onClose) onClose();
  }, [isOpen, onClose]);

  const handleGuardar = async (modalClose) => {
    if (!titulo.trim()) return alert("El título es obligatorio.");
    if (!precio || isNaN(precio) || Number(precio) <= 0)
      return alert("Precio inválido");

    setLoading(true);

    try {
      const response = await axios.post(
        "http://localhost:4000/plans/nuevamembresia",
        {
          titulo: titulo.trim(),
          precio: Number(precio),
        },
        {
          withCredentials: true,
          headers: { "Content-Type": "application/json" },
        }
      );

      alert(response.data.message || "Membresía guardada correctamente");
      setTitulo("");
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
  className="bg-black text-white"
>
  <ModalContent>
    {(modalClose) => (
      <div className="bg-neutral-600 rounded-xl text-white">
        <ModalHeader>
          <div className="w-full text-center text-red-500 text-3xl font-bold">
            Agregar Nueva Membresía
          </div>
        </ModalHeader>

        <ModalBody className="space-y-4">
          <Input
            label="Título"
            placeholder="Ej. Mensual"
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            className="text-black"
            isRequired
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
            className="bg-red-600 hover:bg-red-700 text-white"
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
