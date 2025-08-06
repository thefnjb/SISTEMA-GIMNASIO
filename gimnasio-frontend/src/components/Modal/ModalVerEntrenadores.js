import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  useDisclosure,
  Button
} from "@heroui/react";
import ListaEntrenadores from "../Entrenadores/ListaEntrenadores";

const ModalVerEntrenadores = ({ triggerText = "VER", title = "Entrenadores", refresh }) => {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  return (
    <>
      <Button 
        onPress={onOpen} 
        className="text-white transition-all" 
        style={{ backgroundColor: "#7a0f16" }}
      >
        {triggerText}
      </Button>

      <Modal isOpen={isOpen} onOpenChange={onOpenChange} backdrop="blur" className="text-white bg-black">
        <ModalContent>
          <ModalHeader>
            <div className="w-full text-2xl font-bold text-center text-red-500">{title}</div>
          </ModalHeader>
          <ModalBody>
            <ListaEntrenadores refresh={refresh} />
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};

export default ModalVerEntrenadores;
