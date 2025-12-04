import React, { useState, useEffect } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
} from "@heroui/react";
import ModalPagoComprobante from "./ModalPagoComprobante";
import api from "../../utils/axiosInstance";

export default function ModalEditarClienteDia({
  isOpen,
  onClose,
  cliente,
  onSuccess,
  showAlert,
}) {
  const [nombreEdit, setNombreEdit] = useState("");
  const [dniEdit, setDniEdit] = useState("");
  const [metodoPagoEdit, setMetodoPagoEdit] = useState("");
  const [comprobanteBase64, setComprobanteBase64] = useState(null);
  const [guardando, setGuardando] = useState(false);
  const [showModalComprobante, setShowModalComprobante] = useState(false);

  useEffect(() => {
    if (cliente) {
      setNombreEdit(cliente.nombre || "");
      // Mantener compatibilidad con ambos formatos (dni antiguo o numeroDocumento nuevo)
      setDniEdit(cliente.dni || cliente.numeroDocumento || "");
      setMetodoPagoEdit(cliente.metododePago || "");
      let comprobanteExistente = null;

      if (cliente.comprobante) comprobanteExistente = cliente.comprobante;
      else if (cliente.fotocomprobante?.data) {
        const fc = cliente.fotocomprobante;
        comprobanteExistente = fc.data.startsWith("data:")
          ? fc.data
          : `data:${fc.contentType || "image/jpeg"};base64,${fc.data}`;
      }
      setComprobanteBase64(comprobanteExistente);
    }
  }, [cliente]);


  const handleMetodoPagoChange = (metodo) => {
    setMetodoPagoEdit(metodo);
    if (metodo === "Efectivo") setComprobanteBase64(null);
  };

  const handleUploadComplete = (base64Image) => {
    setComprobanteBase64(base64Image);
    setShowModalComprobante(false);
  };

  const handleGuardarEdicion = async () => {
    if (!cliente?._id) return;

    if (nombreEdit.trim() === "" || metodoPagoEdit.trim() === "") {
      showAlert("danger", "Por favor completa todos los campos.");
      return;
    }

    if ((metodoPagoEdit === "Yape" || metodoPagoEdit === "Plin") && !comprobanteBase64) {
      showAlert("danger", `Debes subir un comprobante para ${metodoPagoEdit}.`);
      return;
    }

    try {
      setGuardando(true);
      const dataToSend = { 
        nombre: nombreEdit, 
        dni: dniEdit.trim() || undefined,
        metododePago: metodoPagoEdit 
      };
      if (comprobanteBase64) dataToSend.comprobante = comprobanteBase64;

      await api.put(`/visits/actualizarcliente/${cliente._id}`, dataToSend);

      showAlert("success", "Cliente actualizado correctamente");
      resetForm();
      onClose();
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error("Error al actualizar cliente:", error);
      showAlert("danger", "Error al guardar los cambios");
    } finally {
      setGuardando(false);
    }
  };

  const resetForm = () => {
    setNombreEdit("");
    setDniEdit("");
    setMetodoPagoEdit("");
    setComprobanteBase64(null);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={handleClose}
        size="md"
        placement="center"
        isDismissable={!showModalComprobante}
      >
        <ModalContent className="bg-[#181a20] text-white rounded-2xl shadow-xl">
          <ModalHeader className="pb-2 text-xl font-semibold border-b border-gray-700">
            Editar Cliente
          </ModalHeader>

          <ModalBody className="pt-4 space-y-5">
            <div>
              <label className="block mb-1 text-sm text-gray-300">Nombre y Apellido</label>
              <Input
                variant="flat"
                radius="md"
                value={nombreEdit}
                onChange={(e) => setNombreEdit(e.target.value)}
                placeholder="Ingrese el nombre"
                classNames={{
                  input: "bg-[#22242c] text-white placeholder:text-gray-500",
                  inputWrapper:
                    "bg-[#22242c] border border-gray-600 hover:border-gray-400 focus-within:border-red-600",
                }}
              />
            </div>

            <div>
              <label className="block mb-1 text-sm text-gray-300">DNI</label>
              <Input
                variant="flat"
                radius="md"
                value={dniEdit}
                isReadOnly
                placeholder="Ej. 75362380"
                classNames={{
                  input: "bg-[#22242c] text-white placeholder:text-gray-500 cursor-not-allowed",
                  inputWrapper:
                    "bg-[#22242c] border border-gray-600 opacity-60 cursor-not-allowed",
                }}
              />
            </div>

            <div>
              <label className="block mb-2 text-sm text-gray-300">Método de Pago</label>
              <div className="p-3 bg-[#22242c] border border-gray-700 rounded-lg">
                <div className="flex justify-center gap-3">
                  {["Yape", "Plin", "Efectivo"].map((m) => (
                    <Button
                      key={m}
                      size="sm"
                      variant={metodoPagoEdit === m ? "solid" : "flat"}
                      onPress={() => handleMetodoPagoChange(m)}
                      className={`capitalize transition-all ${
                        metodoPagoEdit === m
                          ? "bg-red-600 text-white shadow-md"
                          : "bg-[#2a2d36] text-gray-300 hover:bg-[#333641]"
                      }`}
                    >
                      {m}
                    </Button>
                  ))}
                </div>

                {(metodoPagoEdit === "Yape" || metodoPagoEdit === "Plin") && comprobanteBase64 && (
                  <div className="mt-4">
                    <div className="mb-2 text-sm font-medium text-gray-400">
                      Comprobante actual
                    </div>
                    <img
                      src={comprobanteBase64}
                      alt="comprobante"
                      className="object-contain w-full border border-gray-600 rounded-lg max-h-52"
                    />
                    <div className="mt-3 text-center">
                      <Button
                        size="sm"
                        onPress={() => setShowModalComprobante(true)}
                        className="text-white bg-blue-600 hover:bg-blue-700"
                      >
                        Cambiar comprobante
                      </Button>
                    </div>
                  </div>
                )}

                {(metodoPagoEdit === "Yape" || metodoPagoEdit === "Plin") && !comprobanteBase64 && (
                  <div className="mt-4">
                    <Button
                      size="sm"
                      onPress={() => setShowModalComprobante(true)}
                      className="w-full text-white bg-green-600 hover:bg-green-700"
                    >
                      Subir comprobante
                    </Button>
                    <div className="p-2 mt-2 text-center border border-yellow-700 rounded-md bg-yellow-900/30">
                      <span className="text-sm text-yellow-400">
                        ⚠ Se requiere comprobante para {metodoPagoEdit}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </ModalBody>

          <ModalFooter className="pt-3 border-t border-gray-700">
            <Button variant="flat" color="default" onPress={handleClose}>
              Cancelar
            </Button>
            <Button
              color="danger"
              onPress={handleGuardarEdicion}
              isDisabled={guardando}
              className="text-white bg-red-600 hover:bg-red-700"
            >
              {guardando ? "Guardando..." : "Guardar Cambios"}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {showModalComprobante && (
        <ModalPagoComprobante
          isOpen={showModalComprobante}
          onOpenChange={setShowModalComprobante}
          onUploadComplete={handleUploadComplete}
        />
      )}
    </>
  );
}
