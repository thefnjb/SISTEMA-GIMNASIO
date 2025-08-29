import React, { useEffect, useState, useMemo, useCallback } from "react";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Pagination,
  Button,
  CircularProgress,
  Alert,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter
} from "@heroui/react";
import DeleteIcon from '@mui/icons-material/Delete';
import IconButton from '@mui/material/IconButton';
import ModalResumenPagos from "../../Modal/ModalResumenPagos";
import api from "../../../utils/axiosInstance";
/**
  @param {string} timeString 
  @returns {string} 
 */
const formatTime12Hour = (timeString) => {
  if (!timeString || typeof timeString !== 'string') {
    return "Sin hora";
  }

  const date = new Date(`1970-01-01T${timeString}`);
  if (isNaN(date.getTime())) {
    return timeString; 
  }
  return date.toLocaleTimeString('es-PE', { hour: 'numeric', minute: '2-digit', hour12: true });
};

export default function TablaClientesHoy({ refresh }) {
  const [clientes, setClientes] = useState([]);
  const [resumenPagos, setResumenPagos] = useState({ Yape: 0, Plin: 0, Efectivo: 0, Total: 0 });
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [sortDescriptor, setSortDescriptor] = useState({
    column: "nombre",
    direction: "ascending",
  });

  // Sólo permitir ordenar por estos campos
  const allowedSortFields = useMemo(() => new Set(["nombre", "horaInicio", "metododePago"]), []);

  const handleSortChange = useCallback((descriptor) => {
    if (!descriptor || !descriptor.column) return;
    if (allowedSortFields.has(descriptor.column)) {
      setSortDescriptor(descriptor);
    }
  }, [allowedSortFields]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Estados para alertas y confirmación
  const [alert, setAlert] = useState({ show: false, type: 'success', message: '' });
  const [confirmModal, setConfirmModal] = useState({ show: false, clienteId: null, clienteNombre: '' });

  const rowsPerPage = 4;

  // Función para mostrar alertas
  const showAlert = useCallback((type, message) => {
    setAlert({ show: true, type, message });
    setTimeout(() => {
      setAlert({ show: false, type: '', message: '' });
    }, 5000);
  }, []);

  // 🔹 Usar api (axiosInstance) en lugar de axios directo
  const fetchClientes = useCallback(async () => {
    try {
      setIsLoading(true);
      const delayPromise = new Promise(resolve => setTimeout(resolve, 500));

      const apiCallPromise = api.get("/visits/clientesdia");
      const [res] = await Promise.all([apiCallPromise, delayPromise]);

      setClientes(res.data.clientes);
      setResumenPagos(res.data.resumenPagos);
    } catch (err) {
      console.error("Error al obtener clientes:", err);
      showAlert('danger', 'Error al cargar los clientes.');
    } finally {
      setIsLoading(false);
    }
  }, [showAlert]);

  const closeAlert = () => {
    setAlert({ show: false, type: '', message: '' });
  };

  useEffect(() => {
    fetchClientes();
  }, [refresh, fetchClientes]);

  // === Paginación ===
  const pages = useMemo(() => {
    return clientes.length ? Math.ceil(clientes.length / rowsPerPage) : 0;
  }, [clientes.length]);

  const items = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    return clientes.slice(start, end);
  }, [page, clientes]);

  const sortedItems = useMemo(() => {
    const column = sortDescriptor?.column || "nombre";
    const directionFactor = sortDescriptor?.direction === "descending" ? -1 : 1;

    return [...items].sort((a, b) => {
      const first = (a[column] ?? "").toString().toLowerCase();
      const second = (b[column] ?? "").toString().toLowerCase();

      if (first < second) return -1 * directionFactor;
      if (first > second) return 1 * directionFactor;
      return 0;
    });
  }, [sortDescriptor, items]);

  const loadingState = isLoading ? "loading" : "idle";

  // === Función para confirmar eliminación ===
  const handleDeleteConfirm = (cliente) => {
    setConfirmModal({
      show: true,
      clienteId: cliente._id,
      clienteNombre: cliente.nombre
    });
  };

  // === Función para eliminar cliente ===
  const handleDelete = async () => {
    const { clienteId } = confirmModal;
    if (!clienteId) return;

    try {
      await api.delete(`/visits/eliminarcliente/${clienteId}`);
      setConfirmModal({ show: false, clienteId: null, clienteNombre: '' });
      await fetchClientes();
      showAlert('success', 'Cliente eliminado exitosamente');
      
    } catch (err) {
      console.error("Error al eliminar cliente:", err);
      showAlert('danger', 'Error al eliminar el cliente. Por favor, inténtalo de nuevo.');
      setConfirmModal({ show: false, clienteId: null, clienteNombre: '' });
    }
  };

  const cancelDelete = () => {
    setConfirmModal({ show: false, clienteId: null, clienteNombre: '' });
  };

  const totalMontoHoy = useMemo(() => {
    return clientes.reduce((acc, cliente) => acc + (cliente.precio || 7), 0);
  }, [clientes]);

  if (!Array.isArray(clientes)) return null;

  return (
    <div className="p-4 bg-gray-100 rounded-xl">
      <h2 className="mb-4 text-xl font-bold text-black">Clientes de Hoy</h2>
      {/* Sistema de Alertas */}
      {alert.show && (
        <div className="mb-4">
          <Alert
            color={alert.type}
            title={alert.type === 'success' ? 'Éxito' : alert.type === 'danger' ? 'Error' : 'Información'}
            description={alert.message}
            variant="faded"
            isClosable
            onClose={closeAlert}
          />
        </div>
      )}

      <Table
        aria-label="Tabla de clientes de hoy"
        sortDescriptor={sortDescriptor}
        onSortChange={handleSortChange}
        bottomContent={
          pages > 1 ? (
            <div className="flex justify-center w-full mt-3">
              <Pagination
                isCompact
                showControls
                color="primary"
                page={page}
                total={pages}
                onChange={(page) => setPage(page)}
              />
            </div>
          ) : null
        }
        classNames={{
          base: "bg-white rounded-lg shadow",
          th: "text-red-600 font-bold bg-gray-200",
          td: "text-black",
        }}
      >
        <TableHeader>
          <TableColumn key="nombre" allowsSorting>
            Nombre
          </TableColumn>
          <TableColumn key="fecha" allowsSorting>
            Fecha
          </TableColumn>
          <TableColumn key="horaInicio" allowsSorting>
            Hora de Inicio
          </TableColumn>
          <TableColumn key="metododePago" allowsSorting>
            Método de Pago
          </TableColumn>
          <TableColumn key="precio" className="text-right" allowsSorting>
            Monto (S/)
          </TableColumn>
          <TableColumn key="eliminar" className="text-center">Eliminar</TableColumn>
        </TableHeader>

        <TableBody
          items={sortedItems}
          loadingState={loadingState}
          loadingContent={
            <div className="flex items-center justify-center h-40">
              <CircularProgress
                aria-label="Cargando..."
                size="lg"
                color="default"
              />
            </div>
          }
          emptyContent={"Inscriba los Clientes de hoy"}
        >
          {(cliente) => {
            try {
              return (
                <TableRow key={cliente._id || cliente.nombre}>
                  <TableCell>{cliente.nombre || "Sin nombre"}</TableCell>
                  <TableCell>
                    {cliente.fecha
                      ? new Date(cliente.fecha).toLocaleDateString()
                      : "Sin fecha"}
                  </TableCell>
                  <TableCell>{formatTime12Hour(cliente.horaInicio)}</TableCell>
                  <TableCell>{cliente.metododePago || "No definido"}</TableCell>
                  <TableCell className="text-right">
                    {cliente.precio || 7}
                  </TableCell>
                  <TableCell className="text-center">
                    <IconButton
                      aria-label="Eliminar cliente"
                      color="error"
                      onClick={() => handleDeleteConfirm(cliente)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              );
            } catch (error) {
              console.error("Error al renderizar cliente:", error);
              return null;
            }
          }}
        </TableBody>
      </Table>

      {/* Información de Resumen y Botón */}
      <div className="flex items-center justify-end gap-4 mt-4">
        <div className="text-lg font-bold text-black">
          Total Recaudado Hoy: <span className="text-red-600">S/ {totalMontoHoy.toFixed(2)}</span>
        </div>
        <Button 
          className="text-white" 
          style={{ backgroundColor: "#7a0f16" }} 
          variant="solid" 
          onClick={() => setIsModalOpen(true)}
        >
          Detalles de Pagos
        </Button>
      </div>

      {/* Modal de Resumen de Pagos */}
      <ModalResumenPagos
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        clientes={clientes}
        resumenPagos={resumenPagos}
      />

      {/* Modal de Confirmación para Eliminar */}
      <Modal 
        isOpen={confirmModal.show} 
        onClose={cancelDelete}
        placement="center"
      >
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1">
            Confirmar Eliminación
          </ModalHeader>
          <ModalBody>
            <p>¿Deseas borrar al cliente <strong>{confirmModal.clienteNombre}</strong>?</p>
          </ModalBody>
          <ModalFooter>
            <Button 
              color="default"
              style={{ backgroundColor: "#e5e7eb" }} 
              variant="light" 
              onPress={cancelDelete}
            >
              Cancelar
            </Button>
            <Button
              color="danger"
              style={{ backgroundColor: "#7a0f16" }} 
              variant="solid" 
              onPress={handleDelete}
            >
              <DeleteIcon />
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}
