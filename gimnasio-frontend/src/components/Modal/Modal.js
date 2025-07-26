// MyModal.js
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  useDisclosure,
} from "@heroui/react";

const ModalSuscripcion = ({ triggerText = "Abrir Modal", title, body, onAction }) => {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  return (
    <>
      <Button onPress={onOpen}>{triggerText}</Button>

      <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                {title || "Título del Modal"}
              </ModalHeader>
              <ModalBody>
                {body || (
                  <>
                    <p>
                      Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam pulvinar
                      risus non risus hendrerit venenatis. Pellentesque sit amet hendrerit
                      risus, sed porttitor quam.
                    </p>
                    <p>
                      Magna exercitation reprehenderit magna aute tempor cupidatat consequat elit
                      dolor adipisicing. Mollit dolor eiusmod sunt ex incididunt cillum quis.
                    </p>
                  </>
                )}
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  Cerrar
                </Button>
                <Button
                  color="primary"
                  onPress={() => {
                    if (onAction) onAction();
                    onClose();
                  }}
                >
                  Acción
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
};
const ModalDia = ({ triggerText = "Abrir Modal", title, body, onAction }) => {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  return (
    <>
      <Button onPress={onOpen}>{triggerText}</Button>

      <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                {title || "Título del Modal"}
              </ModalHeader>
              <ModalBody>
                {body || (
                  <>
                    <p>
                      Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam pulvinar
                      risus non risus hendrerit venenatis. Pellentesque sit amet hendrerit
                      risus, sed porttitor quam.
                    </p>
                    <p>
                      Magna exercitation reprehenderit magna aute tempor cupidatat consequat elit
                      dolor adipisicing. Mollit dolor eiusmod sunt ex incididunt cillum quis.
                    </p>
                  </>
                )}
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  Cerrar
                </Button>
                <Button
                  color="primary"
                  onPress={() => {
                    if (onAction) onAction();
                    onClose();
                  }}
                >
                  Acción
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
};
export default ModalSuscripcion;
export{ ModalDia };
