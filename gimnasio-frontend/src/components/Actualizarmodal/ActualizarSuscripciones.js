import React, { useState } from "react";
import {
  Input,
  Button,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter
} from "@nextui-org/react";
import axios from "axios";

export default function ActualizarSuscripciones({ miembro, onClose, onUpdated }) {
  const [datos, setDatos] = useState({
    nombre: miembro.nombre || "",
    estado: miembro.estado || "Activo",
    renovacion: miembro.renovacion
      ? new Date(miembro.renovacion).toISOString().split("T")[0]
      : "",
    metodoPago: miembro.metodoPago || "Efectivo",
    celular: miembro.celular || "",
    estadoPago: miembro.estadoPago || "Pendiente"
  });

  const [isLoading, setIsLoading] = useState(false);

  const parseDate = (dateStr) => {
    if (!dateStr) return null;
    const [year, month, day] = dateStr.split("-");
    return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
  };

  const handleActualizar = async () => {
    setIsLoading(true);
    try {
      const datosActualizados = {
        nombre: datos.nombre,
        estado: datos.estado,
        renovacion: parseDate(datos.renovacion),
        metodoPago: datos.metodoPago,
        celular: datos.celular,
        estadoPago: datos.estadoPago
      };

      await axios.patch(
        `http://localhost:4000/members/actualizarmiembro/${miembro._id}`,
        datosActualizados,
        { withCredentials: true }
      );
      onUpdated();
      onClose();
    } catch (error) {
      console.error("Error al actualizar:", error);
      alert("Error al actualizar el miembro. Por favor, inténtalo de nuevo.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      size="2xl"
      scrollBehavior="inside"
    >
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">
          <h2 className="text-xl font-semibold text-gray-800">Actualizar Suscripción</h2>
          <p className="text-sm text-gray-600">Edita la información del miembro</p>
        </ModalHeader>

        <ModalBody>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* Nombre */}
            <div className="md:col-span-2">
              <Input
                type="text"
                placeholder="Nombre"
                value={datos.nombre}
                onChange={(e) => setDatos({ ...datos, nombre: e.target.value })}
                variant="bordered"
              />
            </div>

            {/* Celular */}
            <div className="md:col-span-2">
              <Input
                type="tel"
                placeholder="Celular"
                value={datos.celular}
                onChange={(e) => setDatos({ ...datos, celular: e.target.value })}
                variant="bordered"
              />
            </div>

            {/* Estado */}
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-700">Estado</p>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant={datos.estado === "Activo" ? "solid" : "bordered"}
                  color={datos.estado === "Activo" ? "primary" : "default"}
                  onClick={() => setDatos({ ...datos, estado: "Activo" })}
                  className="flex-1"
                >
                  Activo
                </Button>
                <Button
                  size="sm"
                  variant={datos.estado === "Inactivo" ? "solid" : "bordered"}
                  color={datos.estado === "Inactivo" ? "primary" : "default"}
                  onClick={() => setDatos({ ...datos, estado: "Inactivo" })}
                  className="flex-1"
                >
                  Inactivo
                </Button>
              </div>
            </div>

            {/* Estado de Pago */}
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-700">Estado de Pago</p>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant={datos.estadoPago === "Pagado" ? "solid" : "bordered"}
                  color={datos.estadoPago === "Pagado" ? "success" : "default"}
                  onClick={() => setDatos({ ...datos, estadoPago: "Pagado" })}
                  className="flex-1"
                >
                  Pagado
                </Button>
                <Button
                  size="sm"
                  variant={datos.estadoPago === "Pendiente" ? "solid" : "bordered"}
                  color={datos.estadoPago === "Pendiente" ? "warning" : "default"}
                  onClick={() => setDatos({ ...datos, estadoPago: "Pendiente" })}
                  className="flex-1"
                >
                  Pendiente
                </Button>
              </div>
            </div>

            {/* Método de Pago */}
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-700">Método de Pago</p>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant={datos.metodoPago === "Yape" ? "solid" : "bordered"}
                  color={datos.metodoPago === "Yape" ? "primary" : "default"}
                  onClick={() => setDatos({ ...datos, metodoPago: "Yape" })}
                  className="flex-1"
                >
                  Yape
                </Button>
                <Button
                  size="sm"
                  variant={datos.metodoPago === "Plin" ? "solid" : "bordered"}
                  color={datos.metodoPago === "Plin" ? "primary" : "default"}
                  onClick={() => setDatos({ ...datos, metodoPago: "Plin" })}
                  className="flex-1"
                >
                  Plin
                </Button>
                <Button
                  size="sm"
                  variant={datos.metodoPago === "Efectivo" ? "solid" : "bordered"}
                  color={datos.metodoPago === "Efectivo" ? "primary" : "default"}
                  onClick={() => setDatos({ ...datos, metodoPago: "Efectivo" })}
                  className="flex-1"
                >
                  Efectivo
                </Button>
              </div>
            </div>

            {/* Fecha de Renovación */}
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-700">Fecha de Renovación</p>
              <Input
                type="date"
                placeholder="Fecha de Renovación"
                value={datos.renovacion}
                onChange={(e) => setDatos({ ...datos, renovacion: e.target.value })}
                variant="bordered"
              />
            </div>
          </div>
        </ModalBody>

        <ModalFooter>
          <Button color="default" variant="bordered" onPress={onClose}>
            Cancelar
          </Button>
          <Button
            color="primary"
            onPress={handleActualizar}
            isLoading={isLoading}
          >
            {isLoading ? "Guardando..." : "Guardar Cambios"}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
