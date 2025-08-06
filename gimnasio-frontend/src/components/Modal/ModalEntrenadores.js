import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  useDisclosure,
} from "@heroui/react";
import { useState } from "react";
import axios from "axios";

const ModalEntrenadores = ({ triggerText = "INGRESAR", title = "Entrenadores", onEntrenadorAgregado }) => {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  const [nombre, setNombre] = useState("");
  const [edad, setEdad] = useState("");
  const [telefono, setTelefono] = useState("");
  const [fotoPerfil, setFotoPerfil] = useState(null);

  const agregarEntrenador = async () => {
    if (!nombre.trim() || !edad.trim() || !telefono.trim()) {
      alert("Completa todos los campos.");
      return;
    }

    const formData = new FormData();
    formData.append("nombre", nombre);
    formData.append("edad", edad);
    formData.append("telefono", telefono);
    if (fotoPerfil) formData.append("fotoPerfil", fotoPerfil);

    try {
      await axios.post("http://localhost:4000/trainers/nuevo", formData, {
        withCredentials: true,
        headers: { "Content-Type": "multipart/form-data" },
      });

      setNombre("");
      setEdad("");
      setTelefono("");
      setFotoPerfil(null);

      if (onEntrenadorAgregado) onEntrenadorAgregado();

    } catch (err) {
      console.error("Error al agregar entrenador:", err);
    }
  };

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
                <div className="w-full text-3xl font-bold text-center text-red-500">
                  {title}
                </div>
              </ModalHeader>

              <ModalBody className="space-y-4">
                <Input placeholder="Nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} />
                <Input placeholder="Edad" type="number" value={edad} onChange={(e) => setEdad(e.target.value)} />
                <Input placeholder="Teléfono" value={telefono} onChange={(e) => setTelefono(e.target.value)} />
                <Input type="file" accept="image/*" onChange={(e) => setFotoPerfil(e.target.files[0])}/>
                <Button className="mt-2 text-white bg-red-600 hover:bg-red-700" onPress={agregarEntrenador}>
                  Agregar
                </Button>
              </ModalBody>

              <ModalFooter>
                <Button onPress={onClose} className="text-white border-white" variant="light" color="danger">
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

export default ModalEntrenadores;
