import React, { useMemo } from 'react';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button
} from "@heroui/react";

const metodos = [
  { key: 'Yape', nombre: 'Yape' },
  { key: 'Plin', nombre: 'Plin' },
  { key: 'Efectivo', nombre: 'Efectivo' },
];

export default function ModalResumenPagos({ isOpen, onClose, clientes, resumenPagos }) {
  
  const resumenMontos = useMemo(() => {
    if (!clientes || clientes.length === 0) {
      return { Yape: 0, Plin: 0, Efectivo: 0, TotalMonto: 0 };
    }

    return clientes.reduce((acc, cliente) => {
      const metodo = cliente.metododePago || "Efectivo";
      const precio = cliente.precio || 7;

      if (acc[metodo] !== undefined) {
        acc[metodo] += precio;
      }
      acc.TotalMonto += precio;
      return acc;
    }, { Yape: 0, Plin: 0, Efectivo: 0, TotalMonto: 0 });
  }, [clientes]);

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={onClose}
      hideCloseButton
      backdrop="blur"
      isDismissable={false}
      className="text-white bg-black"
    >
      <ModalContent>
        {(modalClose) => (
          <div className="text-white bg-neutral-600 rounded-xl">
            <ModalHeader>
              <div className="w-full text-2xl font-bold text-center text-red-500">
                Resumen de Pagos de Hoy
              </div>
            </ModalHeader>
            <ModalBody className="space-y-4">
              <div className="space-y-3">
                {/* Header for the payment details */}
                <div className="grid items-center grid-cols-3 px-3 pb-2 font-semibold text-red-400 border-b border-gray-600">
                  <span>Método</span>
                  <span className="text-center">Clientes</span>
                  <span className="text-right">Monto Total</span>
                </div>

                {/* Payment details body */}
                <div className="space-y-2">
                  {metodos.map((metodo) => (
                    <div
                      key={metodo.key}
                      className="grid items-center grid-cols-3 p-3 bg-gray-700 rounded-lg"
                    >
                      <span className="font-medium text-white">{metodo.nombre}</span>
                      <span className="text-center text-gray-300">{resumenPagos[metodo.key] || 0}</span>
                      <span className="font-semibold text-right text-green-400">S/ {(resumenMontos[metodo.key] || 0).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 mt-4 space-y-2 border-t border-gray-600">
                <div className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                  <span className="text-lg font-bold text-white">Total de Clientes</span>
                  <span className="text-lg font-bold text-white">{resumenPagos.Total || 0}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                  <span className="text-lg font-bold text-red-400">Total Recaudado</span>
                  <span className="text-lg font-bold text-red-400">
                    S/ {resumenMontos.TotalMonto.toFixed(2)}
                  </span>
                </div>
              </div>
            </ModalBody>
            <ModalFooter>
              <Button onPress={modalClose} className="text-white border-white" variant="light" color="danger">
                Cerrar
              </Button>
            </ModalFooter>
          </div>
        )}
      </ModalContent>
    </Modal>
  );
}