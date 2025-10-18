import React, { useState } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Input,
  Button
} from "@nextui-org/react";
import api from "../../../utils/axiosInstance";

// 🚨 ALERTA REUTILIZABLE
const CustomAlert = ({ visible, onClose, message }) => {
  if (!visible) return null;

  return (
    <div
      style={{
        position: "fixed",
        bottom: "20px",
        right: "20px",
        zIndex: 9999,
        minWidth: "320px",
        transition: "all 0.3s ease-in-out",
        transform: visible ? "translateX(0)" : "translateX(100%)"
      }}
    >
      <div className="flex items-start gap-3 px-4 py-3 text-green-800 bg-green-100 border border-green-400 rounded-lg shadow-lg">
        <div className="flex-shrink-0 mt-1">
          <div className="flex items-center justify-center w-6 h-6 font-bold text-white bg-green-500 rounded-full">
            ✓
          </div>
        </div>
        <div className="flex-1">
          <p className="text-sm font-bold">¡Éxito!</p>
          <p className="text-sm">{message}</p>
        </div>
        <button
          onClick={onClose}
          className="flex-shrink-0 px-1 text-lg font-bold text-green-700 hover:text-green-900"
        >
          ×
        </button>
      </div>
    </div>
  );
};

export default function EditarDeuda({ miembro, onClose, onUpdated }) {
  const [deuda, setDeuda] = useState(miembro?.debe || 0);
  const [guardando, setGuardando] = useState(false);

  // 🔔 Control alerta
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  const handleGuardar = async () => {
    try {
      setGuardando(true);
      await api.put(
        `/members/miembros/${miembro._id}`,
        { debe: deuda },
        { withCredentials: true }
      );

      setToastMessage("Deuda actualizada correctamente");
      setToastVisible(true);

      // Ocultar alerta y cerrar modal
      setTimeout(() => {
        setToastVisible(false);
        onClose();
      }, 2000);

      onUpdated(); // refresca lista
    } catch (error) {
      console.error(
        "Error al actualizar deuda:",
        error.response?.data || error.message
      );
    } finally {
      setGuardando(false);
    }
  };

  return (
    <>
      <Modal isOpen={true} onClose={onClose} size="md" placement="center">
        <ModalContent className="text-white bg-black shadow-2xl rounded-xl">
          <ModalHeader className="flex flex-col gap-1 p-4 text-white bg-gradient-to-r from-red-700 to-red-500 rounded-t-xl">
            Editar deuda de {miembro?.nombreCompleto}
            <span className="text-sm font-normal text-gray-200">
              Modifica el monto de deuda pendiente
            </span>
          </ModalHeader>
          <ModalBody className="p-6">
<div className="flex flex-col w-full gap-2">
  <label className="text-sm font-semibold text-white">
    Monto de deuda
  </label>
  <Input
    type="number"
    value={deuda}
    onChange={(e) => setDeuda(e.target.value)}
    startContent={<span className="font-semibold text-gray-600">S/</span>}
    classNames={{
      inputWrapper:
        "bg-white rounded-lg shadow-md border border-gray-300 focus-within:border-red-500",
      input: "pl-8 text-black"
    }}
  />
</div>


          </ModalBody>
          <ModalFooter className="flex justify-end gap-3 p-4">
            <Button
              className="text-white bg-gray-800 shadow-md rounded-xl hover:bg-gray-700"
              variant="light"
              onClick={onClose}
            >
              Cancelar
            </Button>
            <Button
              className="text-white bg-red-600 shadow-md rounded-xl hover:bg-red-700"
              isLoading={guardando}
              onClick={handleGuardar}
            >
              Guardar Cambios
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* 🔔 ALERTA */}
      <CustomAlert
        visible={toastVisible}
        onClose={() => setToastVisible(false)}
        message={toastMessage}
      />
    </>
  );
}
