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

const ModalEntrenadores = ({ triggerText = "INGRESAR", title = "Entrenadores" }) => {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  const [nombre, setNombre] = useState("");
  const [edad, setEdad] = useState("");
  const [telefono, setTelefono] = useState("");
  const [fotoPerfil, setFotoPerfil] = useState("");

  const agregarEntrenador = async () => {
    if (!nombre.trim() || !edad.trim() || !telefono.trim()) {
      alert("Completa todos los campos.");
      return;
    }

    try {
      await axios.post(
        "http://localhost:4000/trainers/nuevo",
        { nombre, edad, telefono, fotoPerfil },
        { withCredentials: true }
      );
      setNombre("");
      setEdad("");
      setTelefono("");
      setFotoPerfil("");
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
        className="bg-black text-white"
      >
        <ModalContent>
          {(onClose) => (
            <div className="bg-neutral-600 rounded-xl text-white">
              <ModalHeader>
                <div className="w-full text-center text-red-500 text-3xl font-bold">
                  {title}
                </div>
              </ModalHeader>

              <ModalBody className="space-y-4">
                <Input placeholder="Nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} />
                <Input placeholder="Edad" type="number" value={edad} onChange={(e) => setEdad(e.target.value)} />
                <Input placeholder="Teléfono" value={telefono} onChange={(e) => setTelefono(e.target.value)} />
                <Input placeholder="URL Foto de Perfil" value={fotoPerfil} onChange={(e) => setFotoPerfil(e.target.value)} />
                <Button className="mt-2 bg-red-600 hover:bg-red-700 text-white" onPress={agregarEntrenador}>
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
