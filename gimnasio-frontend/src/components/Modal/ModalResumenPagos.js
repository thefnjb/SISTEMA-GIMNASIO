import React from 'react';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell
} from "@heroui/react";

export default function ModalResumenPagos({ isOpen, onClose, clientes, resumenPagos }) {
  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1 text-red-600">Resumen de Clientes y Pagos de Hoy</ModalHeader>
        <ModalBody>
          <div className="mb-4">
            <h4 className="text-lg font-bold text-black">Totales por Método de Pago:</h4>
            <Table
              aria-label="Tabla resumen de pagos"
              classNames={{
                base: "bg-white rounded-lg shadow",
                th: "text-red-600 font-bold bg-gray-200",
                td: "text-black",
              }}
            >
              <TableHeader>
                <TableColumn key="metodo">Método de Pago</TableColumn>
                <TableColumn key="cantidad" className="text-right">Cantidad</TableColumn>
              </TableHeader>
              <TableBody>
                <TableRow key="yape">
                  <TableCell>Yape</TableCell>
                  <TableCell className="text-right">{resumenPagos.Yape}</TableCell>
                </TableRow>
                <TableRow key="plin">
                  <TableCell>Plin</TableCell>
                  <TableCell className="text-right">{resumenPagos.Plin}</TableCell>
                </TableRow>
                <TableRow key="efectivo">
                  <TableCell>Efectivo</TableCell>
                  <TableCell className="text-right">{resumenPagos.Efectivo}</TableCell>
                </TableRow>
                <TableRow key="total">
                  <TableCell className="font-bold">Total de Clientes</TableCell>
                  <TableCell className="text-right font-bold text-red-600">{resumenPagos.Total}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button color="danger" variant="light" onClick={onClose}>
            Cerrar
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}