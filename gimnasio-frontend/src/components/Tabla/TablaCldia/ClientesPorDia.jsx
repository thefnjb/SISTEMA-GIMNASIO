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
import EditIcon from "@mui/icons-material/Edit";
import AdfScannerRoundedIcon from "@mui/icons-material/AdfScannerRounded";
import SwapHorizIcon from "@mui/icons-material/SwapHoriz";
import IconButton from "@mui/material/IconButton";
import { Chip } from "@heroui/react";
import ReporteClientesDia from "../../Pdf/BotonpdfClientesdia";
import ModalEditarClienteDia from "../../Modal/ModalEditarClienteDia";
import TodosClientes from "./TodosClientes";
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
  const [mostrarTodos, setMostrarTodos] = useState(false);
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
    setTimeout(() => setAlert({ show: false, type: "", message: "" }), 4000);
  }, []);

  // Confirmación de eliminación
  const [confirmModal, setConfirmModal] = useState({
    show: false,
    clienteId: null,
    clienteNombre: "",
  });

  // Modal editar cliente
  const [modalEditar, setModalEditar] = useState({
    show: false,
    cliente: null,
  });

  const openModalEditar = (cliente) => {
    setModalEditar({ show: true, cliente });
  };

  const closeModalEditar = () => {
    setModalEditar({ show: false, cliente: null });
  };

  // Modal ver comprobante
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [imageUrl, setImageUrl] = useState(null);

  const metodosPago = {
    yape: { nombre: "Yape", color: "bg-purple-700", icono: "/iconos/yape.png" },
    plin: { nombre: "Plin", color: "bg-blue-600", icono: "/iconos/plin.png" },
    efectivo: { nombre: "Efectivo", color: "bg-green-600", icono: "/iconos/eefctivo.png" },
  };

  const openComprobanteModal = (cliente) => {
    // Buscar comprobante en múltiples ubicaciones posibles
    let comprobanteUrl = null;
    
    // Opción 1: campo comprobante directo
    if (cliente.comprobante) {
      comprobanteUrl = cliente.comprobante;
    }
    // Opción 2: fotocomprobante.data (puede ser string o objeto)
    else if (cliente.fotocomprobante?.data) {
      const fc = cliente.fotocomprobante;
      if (typeof fc.data === 'string') {
        comprobanteUrl = fc.data.startsWith('data:') ? fc.data : `data:${fc.contentType || 'image/jpeg'};base64,${fc.data}`;
      } else if (fc.data.type === 'Buffer' && Array.isArray(fc.data.data)) {
        // Convertir array de bytes a base64
        const base64 = btoa(String.fromCharCode.apply(null, fc.data.data));
        comprobanteUrl = `data:${fc.contentType || 'image/jpeg'};base64,${base64}`;
      }
    }
    
    if (!comprobanteUrl) {
      showAlert("warning", "No hay comprobante guardado");
      return;
    }
    
    setImageUrl(comprobanteUrl);
    setIsImageModalOpen(true);
  };

  const closeImageModal = () => {
    if (imageUrl && imageUrl.startsWith('blob:')) {
      URL.revokeObjectURL(imageUrl);
    }
    setImageUrl(null);
    setIsImageModalOpen(false);
  };

  const rowsPerPage = 4;

  // 🔹 Descargar voucher
  const descargarVoucher = async (cliente) => {
    try {
      const miembroId = cliente?._id || cliente?.id;
      const nombreCliente = cliente?.nombre || "cliente";
      if (!miembroId) {
        showAlert("danger", "ID inválido para descargar el voucher.");
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
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error al descargar voucher:", error);
      showAlert("danger", "No se pudo generar el voucher.");
    }
  };

  // 🔹 Obtener clientes
  const fetchClientes = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await api.get("/visits/clientesdia");
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
      showAlert("danger", "Error al eliminar el cliente.");
      setConfirmModal({ show: false, clienteId: null, clienteNombre: "" });
    }
  };

  const cancelDelete = () =>
    setConfirmModal({ show: false, clienteId: null, clienteNombre: "" });

  const totalMontoHoy = useMemo(
    () => clientes.reduce((acc, cliente) => acc + (cliente.monto != null ? cliente.monto : 7), 0),
    [clientes]
  );

  const pages = Math.ceil(clientes.length / rowsPerPage);
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

  if (!Array.isArray(clientes)) return null;

  // Si mostrarTodos es true, mostrar el componente TodosClientes
  if (mostrarTodos) {
    return (
      <div className="p-3 sm:p-4 md:p-6 bg-gray-100 rounded-xl">
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <div className="flex items-center gap-2">
            <h2 className="text-lg sm:text-xl font-bold text-black">Clientes Constantes</h2>
            <IconButton
              aria-label="Cambiar a clientes de hoy"
              onClick={() => setMostrarTodos(false)}
              sx={{ 
                color: "#d32f2f", 
                "&:hover": { color: "#9a1b1b", backgroundColor: "rgba(211, 47, 47, 0.1)" },
                p: 0.5
              }}
              size="small"
            >
              <SwapHorizIcon sx={{ fontSize: { xs: 20, sm: 24 } }} />
            </IconButton>
          </div>
        </div>
        <TodosClientes 
          refresh={refresh} 
          mostrarTitulo={false}
          onClienteEliminado={fetchClientes}
        />
      </div>
    );
  }

  return (
    <div className="p-3 sm:p-4 md:p-6 bg-gray-100 rounded-xl">
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <div className="flex items-center gap-2">
          <h2 className="text-lg sm:text-xl font-bold text-black">Clientes de Hoy</h2>
          <IconButton
            aria-label="Cambiar a clientes constantes"
            onClick={() => setMostrarTodos(true)}
            sx={{ 
              color: "#d32f2f", 
              "&:hover": { color: "#9a1b1b", backgroundColor: "rgba(211, 47, 47, 0.1)" },
              p: 0.5
            }}
            size="small"
          >
            <SwapHorizIcon sx={{ fontSize: { xs: 20, sm: 24 } }} />
          </IconButton>
        </div>
      </div>

      {alert.show && (
        <div className="mb-4">
          <Alert
            color={alert.type}
            title={alert.type === "success" ? "Éxito" : alert.type === "danger" ? "Error" : "Info"}
            description={alert.message}
            variant="faded"
            isClosable
            onClose={() => setAlert({ show: false, type: "", message: "" })}
          />
        </div>
      )}

      <div className="w-full overflow-x-auto -mx-3 sm:-mx-4 md:mx-0 px-3 sm:px-4 md:px-0">
        <Table
          aria-label="Tabla de clientes de hoy"
          sortDescriptor={sortDescriptor}
          onSortChange={handleSortChange}
          removeWrapper
          bottomContent={
            pages > 1 && (
              <div className="flex justify-center mt-3">
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
            base: "min-w-full",
            wrapper: "bg-white rounded-lg shadow",
            table: "min-w-full",
            th: "text-red-600 font-bold bg-gray-200 text-[10px] xs:text-xs sm:text-sm px-2 sm:px-3 py-2 sm:py-3 whitespace-nowrap",
            td: "text-black text-[10px] xs:text-xs sm:text-sm px-2 sm:px-3 py-2 sm:py-3",
            tr: "hover:bg-gray-50 transition-colors",
          }}
        >
          <TableHeader>
            <TableColumn key="nombre" allowsSorting className="min-w-[100px] sm:min-w-[120px]">Nombre</TableColumn>
            <TableColumn key="documento" allowsSorting className="min-w-[90px] sm:min-w-[120px]">Documento</TableColumn>
            <TableColumn key="fecha" allowsSorting className="hidden sm:table-cell min-w-[90px]">Fecha</TableColumn>
            <TableColumn key="horaInicio" allowsSorting className="min-w-[70px] sm:min-w-[100px]">Hora</TableColumn>
            <TableColumn key="metododePago" allowsSorting className="text-center min-w-[60px] sm:min-w-[80px]">PAGO</TableColumn>
            <TableColumn key="precio" className="text-right min-w-[60px] sm:min-w-[80px]" allowsSorting>Monto</TableColumn>
            <TableColumn key="cambios" className="text-center hidden lg:table-cell min-w-[100px]">Cambios</TableColumn>
            <TableColumn key="acciones" className="text-center min-w-[100px] sm:min-w-[120px]">Acciones</TableColumn>
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
              <TableCell className="font-medium whitespace-nowrap">
                <div className="truncate max-w-[100px] sm:max-w-none" title={cliente.nombre || "Sin nombre"}>
                  {cliente.nombre || "Sin nombre"}
                </div>
              </TableCell>
              <TableCell>
                {cliente.tipoDocumento && cliente.numeroDocumento ? (
                  <div className="flex flex-col gap-0.5">
                    <Chip 
                      color={cliente.tipoDocumento === "DNI" ? "primary" : "secondary"} 
                      variant="flat"
                      size="sm"
                      className="text-[9px] xs:text-[10px] h-4 sm:h-5 w-fit"
                    >
                      {cliente.tipoDocumento === "CE" ? "CE" : cliente.tipoDocumento || "DNI"}
                    </Chip>
                    <span className="text-[8px] xs:text-[9px] text-gray-600 truncate max-w-[80px] sm:max-w-none">
                      {cliente.numeroDocumento}
                    </span>
                  </div>
                ) : (
                  <span className="text-gray-400 text-[10px]">-</span>
                )}
              </TableCell>
              <TableCell className="hidden sm:table-cell whitespace-nowrap">
                {cliente.fecha ? new Date(cliente.fecha).toLocaleDateString("es-PE", { day: "2-digit", month: "2-digit" }) : "Sin fecha"}
              </TableCell>
              <TableCell className="whitespace-nowrap text-[9px] xs:text-[10px] sm:text-xs">
                {formatTime12Hour(cliente.horaInicio)}
              </TableCell>
              <TableCell className="text-center">
                <div className="flex items-center justify-center">
                  {cliente.metododePago && metodosPago[cliente.metododePago.toLowerCase()] && (
                    <>
                      {cliente.metododePago.toLowerCase() === 'efectivo' ? (
                        <div className="p-0.5 sm:p-1 cursor-default">
                          <img
                            src={metodosPago[cliente.metododePago.toLowerCase()].icono}
                            alt={metodosPago[cliente.metododePago.toLowerCase()].nombre}
                            className="object-contain w-5 h-5 sm:w-6 sm:h-6 opacity-80"
                          />
                        </div>
                      ) : (
                        <Button
                          isIconOnly
                          size="sm"
                          onClick={() => openComprobanteModal(cliente)}
                          className="p-0.5 sm:p-1 bg-transparent hover:opacity-80 min-w-0 w-auto h-auto"
                        >
                          <img
                            src={metodosPago[cliente.metododePago.toLowerCase()].icono}
                            alt={metodosPago[cliente.metododePago.toLowerCase()].nombre}
                            className="object-contain w-5 h-5 sm:w-6 sm:h-6"
                          />
                        </Button>
                      )}
                    </>
                  )}
                </div>
              </TableCell>
              <TableCell className="text-right font-semibold whitespace-nowrap text-[10px] xs:text-xs sm:text-sm">
                S/ {cliente.monto ?? 7}
              </TableCell>
              <TableCell className="text-center hidden lg:table-cell whitespace-nowrap">
                <span className="text-[9px] xs:text-[10px] sm:text-xs font-normal text-black">
                  {cliente.creadoPor === "admin"
                    ? "Admin"
                    : cliente.creadoPor === "trabajador"
                    ? (cliente.creadorNombre || "Trabajador").substring(0, 10)
                    : "Desconocido"}
                </span>
              </TableCell>
              <TableCell className="text-center">
                <div className="flex items-center justify-center gap-0.5 sm:gap-1 md:gap-2">
                  <IconButton
                    aria-label="Descargar voucher"
                    onClick={() => descargarVoucher(cliente)}
                    sx={{ color: "#d32f2f", "&:hover": { color: "#9a1b1b" }, p: 0.5 }}
                    size="small"
                  >
                    <AdfScannerRoundedIcon sx={{ fontSize: { xs: 18, sm: 20, md: 24 } }} />
                  </IconButton>
                  <IconButton
                    aria-label="Editar cliente"
                    onClick={() => openModalEditar(cliente)}
                    sx={{ color: "#d32f2f", "&:hover": { color: "#9a1b1b" }, p: 0.5 }}
                    size="small"
                  >
                    <EditIcon sx={{ fontSize: { xs: 18, sm: 20, md: 24 } }} />
                  </IconButton>
                  <IconButton
                    aria-label="Eliminar cliente"
                    color="error"
                    onClick={() => handleDeleteConfirm(cliente)}
                    sx={{ p: 0.5 }}
                    size="small"
                  >
                    <DeleteIcon sx={{ fontSize: { xs: 18, sm: 20, md: 24 } }} />
                  </IconButton>
                </div>
              </TableCell>
    </TableRow>
  )}
</TableBody>
        </Table>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-0 mt-4">
        <div className="text-base sm:text-lg font-bold text-black">
          Total Recaudado Hoy: <span className="text-red-600">S/ {totalMontoHoy.toFixed(2)}</span>
        </div>
        <ReporteClientesDia />
      </div>

    {/* Modal eliminar */}
    <Modal 
      isOpen={confirmModal.show} 
      onClose={cancelDelete} 
      placement="center"
      backdrop="blur"
    >
      <ModalContent className="p-4 shadow-lg rounded-2xl">
        <ModalHeader className="text-lg font-semibold text-red-600">
          Confirmar eliminación
        </ModalHeader>
        <ModalBody className="text-sm text-gray-700">
          <p>
            ¿Seguro que deseas eliminar al cliente{" "}
            <span className="font-semibold text-black">
              {confirmModal.clienteNombre}
            </span>?
          </p>
        </ModalBody>
        <ModalFooter className="flex justify-end gap-3">
          <Button 
            color="default" 
            variant="flat" 
            onPress={cancelDelete}
            className="px-4"
          >
            Cancelar
          </Button>
          <Button 
            color="danger" 
            onPress={handleDelete}
            className="flex items-center gap-2 px-4"
          >
            <DeleteIcon fontSize="small" />
            Eliminar
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>

      {/* Modal editar cliente */}
      <ModalEditarClienteDia
        isOpen={modalEditar.show}
        onClose={closeModalEditar}
        cliente={modalEditar.cliente}
        onSuccess={fetchClientes}
        showAlert={showAlert}
      />

      {/* Modal para mostrar comprobante */}
      <Modal 
        isOpen={isImageModalOpen} 
        onOpenChange={(val) => { if (!val) closeImageModal(); setIsImageModalOpen(val); }} 
        size="lg" 
        backdrop="blur"
      >
        <ModalContent>
          {(onClose) => (
            <div className="text-white rounded-lg bg-neutral-800">
              <ModalHeader>
                <div className="text-lg font-bold text-center">Comprobante de Pago</div>
              </ModalHeader>
              <ModalBody className="p-4">
                {imageUrl ? (
                  <img 
                    src={imageUrl} 
                    alt="comprobante" 
                    className="w-full h-auto max-h-[70vh] object-contain rounded" 
                  />
                ) : (
                  <div className="text-sm text-center text-gray-300">No hay imagen disponible</div>
                )}
              </ModalBody>
              <ModalFooter>
                <Button 
                  onClick={() => { closeImageModal(); onClose(); }} 
                  className="text-white bg-red-600 hover:bg-red-700"
                >
                  Cerrar
                </Button>
              </ModalFooter>
            </div>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
}
