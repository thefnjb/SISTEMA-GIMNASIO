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
  ModalFooter,
} from "@heroui/react";
import DeleteIcon from "@mui/icons-material/Delete";
import IconButton from "@mui/material/IconButton";
import AdfScannerRoundedIcon from "@mui/icons-material/AdfScannerRounded";
import ReporteClientesDia from "../../../components/Pdf/BotonpdfClientesdia"; 
import api from "../../../utils/axiosInstance";

// 🔹 Función para formatear hora
const formatTime12Hour = (timeString) => {
  if (!timeString || typeof timeString !== "string") return "Sin hora";

  const date = new Date(`1970-01-01T${timeString}`);
  if (isNaN(date.getTime())) return timeString;

  return date.toLocaleTimeString("es-PE", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
};

export default function TablaClientesHoy({ refresh }) {
  const [clientes, setClientes] = useState([]);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [sortDescriptor, setSortDescriptor] = useState({
    column: "nombre",
    direction: "ascending",
  });

  const allowedSortFields = useMemo(
    () => new Set(["nombre", "horaInicio", "metododePago"]),
    []
  );

  const handleSortChange = useCallback(
    (descriptor) => {
      if (!descriptor || !descriptor.column) return;
      if (allowedSortFields.has(descriptor.column)) {
        setSortDescriptor(descriptor);
      }
    },
    [allowedSortFields]
  );

  // Alertas
  const [alert, setAlert] = useState({
    show: false,
    type: "success",
    message: "",
  });

  const showAlert = useCallback((type, message) => {
    setAlert({ show: true, type, message });
    setTimeout(() => setAlert({ show: false, type: "", message: "" }), 5000);
  }, []);

  // Confirmación de eliminación
  const [confirmModal, setConfirmModal] = useState({
    show: false,
    clienteId: null,
    clienteNombre: "",
  });

  const rowsPerPage = 4;

  // 🔹 Descargar voucher
  const descargarVoucher = async (cliente) => {
    try {
      // Extraer id y nombre del objeto cliente
      const miembroId = cliente?._id || cliente?.id;
      const nombreCliente = cliente?.nombre || "cliente";

      if (!miembroId) {
        showAlert("danger", "ID de cliente inválido para descargar el voucher.");
        return;
      }

      const response = await api.get(`/pdfvoucher/dia/${miembroId}`, {
        responseType: "blob",
        withCredentials: true,
        headers: { Accept: "application/pdf" },
      });

      const blob = response.data;
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      const nombreLimpio = nombreCliente.replace(/\s+/g, "_").replace(/[^\w-]/g, "");
      link.href = url;
      link.setAttribute("download", `voucher_${nombreLimpio}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      // Liberar URL
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error al descargar voucher:", error);
      if (error.response && error.response.status === 401) {
        showAlert("danger", "No autorizado. Por favor inicia sesión.");
      } else if (error.response && error.response.status === 404) {
        showAlert("danger", "Voucher no encontrado (404).");
      } else {
        showAlert("danger", "No se pudo generar el voucher.");
      }
    }
  };

  // 🔹 Fetch de clientes
  const fetchClientes = useCallback(async () => {
    try {
      setIsLoading(true);
      const delayPromise = new Promise((resolve) => setTimeout(resolve, 500));
      const apiCallPromise = api.get("/visits/clientesdia");

      const [res] = await Promise.all([apiCallPromise, delayPromise]);
      setClientes(res.data.clientes);
    } catch (err) {
      console.error("Error al obtener clientes:", err);
      showAlert("danger", "Error al cargar los clientes.");
    } finally {
      setIsLoading(false);
    }
  }, [showAlert]);

  useEffect(() => {
    fetchClientes();
  }, [refresh, fetchClientes]);

  const closeAlert = () => setAlert({ show: false, type: "", message: "" });

  // Paginación
  const pages = useMemo(
    () => (clientes.length ? Math.ceil(clientes.length / rowsPerPage) : 0),
    [clientes.length]
  );

  const items = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    return clientes.slice(start, start + rowsPerPage);
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

  // Eliminar cliente
  const handleDeleteConfirm = (cliente) =>
    setConfirmModal({
      show: true,
      clienteId: cliente._id,
      clienteNombre: cliente.nombre,
    });

  const handleDelete = async () => {
    if (!confirmModal.clienteId) return;
    try {
      await api.delete(`/visits/eliminarcliente/${confirmModal.clienteId}`);
      setConfirmModal({ show: false, clienteId: null, clienteNombre: "" });
      await fetchClientes();
      showAlert("success", "Cliente eliminado exitosamente");
    } catch (err) {
      console.error("Error al eliminar cliente:", err);
      showAlert("danger", "Error al eliminar el cliente. Intenta de nuevo.");
      setConfirmModal({ show: false, clienteId: null, clienteNombre: "" });
    }
  };

  const cancelDelete = () =>
    setConfirmModal({ show: false, clienteId: null, clienteNombre: "" });

  // Calcular total del día (usar campo 'monto' del modelo)
  const totalMontoHoy = useMemo(
    () => clientes.reduce((acc, cliente) => acc + (cliente.monto != null ? cliente.monto : 7), 0),
    [clientes]
  );

  if (!Array.isArray(clientes)) return null;

  return (
    <div className="p-4 bg-gray-100 rounded-xl">
      <h2 className="mb-4 text-xl font-bold text-black">Clientes de Hoy</h2>

      {/* Alertas */}
      {alert.show && (
        <div className="mb-4">
          <Alert
            color={alert.type}
            title={alert.type === "success" ? "Éxito" : alert.type === "danger" ? "Error" : "Información"}
            description={alert.message}
            variant="faded"
            isClosable
            onClose={closeAlert}
          />
        </div>
      )}

      {/* Tabla */}
      <Table
        aria-label="Tabla de clientes de hoy"
        sortDescriptor={sortDescriptor}
        onSortChange={handleSortChange}
        bottomContent={
          pages > 1 && (
            <div className="flex justify-center w-full mt-3">
              <Pagination
                isCompact
                showControls
                color="primary"
                page={page}
                total={pages}
                onChange={(p) => setPage(p)}
              />
            </div>
          )
        }
        classNames={{
          base: "bg-white rounded-lg shadow",
          th: "text-red-600 font-bold bg-gray-200",
          td: "text-black",
        }}
      >
        <TableHeader>
          <TableColumn key="nombre" allowsSorting>Nombre</TableColumn>
          <TableColumn key="fecha" allowsSorting>Fecha</TableColumn>
          <TableColumn key="horaInicio" allowsSorting>Hora de Inicio</TableColumn>
          <TableColumn key="metododePago" allowsSorting>Método de Pago</TableColumn>
          <TableColumn key="precio" className="text-right" allowsSorting>Monto (S/)</TableColumn>
          <TableColumn key="voucher" className="text-center">Voucher</TableColumn>
          <TableColumn key="eliminar" className="text-center">Eliminar</TableColumn>
        </TableHeader>

        <TableBody
          items={sortedItems}
          loadingState={loadingState}
          loadingContent={
            <div className="flex items-center justify-center h-40">
              <CircularProgress aria-label="Cargando..." size="lg" color="default" />
            </div>
          }
          emptyContent={"Inscriba los Clientes de hoy"}
        >
          {(cliente) => (
            <TableRow key={cliente._id || cliente.nombre}>
              <TableCell>{cliente.nombre || "Sin nombre"}</TableCell>
              <TableCell>{cliente.fecha ? new Date(cliente.fecha).toLocaleDateString() : "Sin fecha"}</TableCell>
              <TableCell>{formatTime12Hour(cliente.horaInicio)}</TableCell>
              <TableCell>{cliente.metododePago || "No definido"}</TableCell>
              <TableCell className="text-right">{cliente.monto != null ? cliente.monto : 7}</TableCell>

              {/* 🔹 Botón Voucher */}
              <TableCell className="text-center">
                <AdfScannerRoundedIcon
                  onClick={() => descargarVoucher(cliente)}
                  sx={{ color: "#d32f2f", fontSize: 26, cursor: "pointer" }}
                />
              </TableCell>

              {/* 🔹 Botón Eliminar */}
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
          )}
        </TableBody>
      </Table>

      {/* Resumen y botones */}
      <div className="flex items-center justify-between mt-4">
        <div className="text-lg font-bold text-black">
          Total Recaudado Hoy: <span className="text-red-600">S/ {totalMontoHoy.toFixed(2)}</span>
        </div>

        <div className="flex gap-3">
          <ReporteClientesDia />
        </div>
      </div>

      {/* Modal confirmación eliminar */}
      <Modal isOpen={confirmModal.show} onClose={cancelDelete} placement="center">
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1">Confirmar Eliminación</ModalHeader>
          <ModalBody>
            <p>¿Deseas borrar al cliente <strong>{confirmModal.clienteNombre}</strong>?</p>
          </ModalBody>
          <ModalFooter>
            <Button color="default" style={{ backgroundColor: "#e5e7eb" }} variant="light" onPress={cancelDelete}>
              Cancelar
            </Button>
            <Button color="danger" style={{ backgroundColor: "#7a0f16" }} variant="solid" onPress={handleDelete}>
              <DeleteIcon />
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}
