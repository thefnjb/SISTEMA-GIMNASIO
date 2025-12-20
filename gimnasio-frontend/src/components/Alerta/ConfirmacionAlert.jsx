import React from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
} from "@heroui/react";

const ConfirmacionAlert = ({
  isOpen,
  onClose,
  onConfirm,
  title = "Confirmar acción",
  message = "¿Estás seguro de realizar esta acción?",
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  variant = "danger",
  loading = false,
  disableConfirm = false,
}) => {
  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      backdrop="blur"
      isDismissable={!loading}
      className="text-white bg-black"
    >
      <ModalContent>
        {(modalClose) => (
          <>
            <ModalHeader>
              <div className="w-full text-xl font-bold text-center text-color-acentos">
                {title}
              </div>
            </ModalHeader>
            <ModalBody>
              <p className="text-center text-gray-300">{message}</p>
            </ModalBody>
            <ModalFooter>
              <Button
                onPress={modalClose}
                variant="light"
                className="text-white border-white"
                isDisabled={loading}
              >
                {cancelText}
              </Button>
              <Button
                onPress={() => {
                  handleConfirm();
                }}
                color={variant}
                className="text-white"
                isLoading={loading}
                isDisabled={loading || disableConfirm}
              >
                {confirmText}
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

export default ConfirmacionAlert;

