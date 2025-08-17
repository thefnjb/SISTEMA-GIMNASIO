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
import axios from "axios";

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
      <div className="bg-green-100 border border-green-400 text-green-800 px-4 py-3 rounded-lg shadow-lg flex items-start gap-3">
        <div className="flex-shrink-0 mt-1">
          <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center text-white font-bold">
            ✓
          </div>
        </div>
        <div className="flex-1">
          <p className="font-bold text-sm">¡Éxito!</p>
          <p className="text-sm">{message}</p>
        </div>
        <button
          onClick={onClose}
          className="flex-shrink-0 text-green-700 hover:text-green-900 text-lg font-bold px-1"
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
      await axios.put(
        `http://localhost:4000/members/miembros/${miembro._id}`,
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
        <ModalContent className="bg-black text-white rounded-xl shadow-2xl">
          <ModalHeader className="flex flex-col gap-1 bg-gradient-to-r from-red-700 to-red-500 text-white rounded-t-xl p-4">
            Editar deuda de {miembro?.nombreCompleto}
            <span className="text-sm text-gray-200 font-normal">
              Modifica el monto de deuda pendiente
            </span>
          </ModalHeader>
          <ModalBody className="p-6">
<div className="flex flex-col gap-2 w-full">
  <label className="text-sm font-semibold text-white">
    Monto de deuda
  </label>
  <Input
    type="number"
    value={deuda}
    onChange={(e) => setDeuda(e.target.value)}
    startContent={<span className="text-gray-600 font-semibold">S/</span>}
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
              className="bg-gray-800 text-white rounded-xl shadow-md hover:bg-gray-700"
              variant="light"
              onClick={onClose}
            >
              Cancelar
            </Button>
            <Button
              className="bg-red-600 text-white rounded-xl shadow-md hover:bg-red-700"
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
