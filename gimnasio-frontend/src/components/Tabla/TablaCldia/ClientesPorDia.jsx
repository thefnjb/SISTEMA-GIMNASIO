import React, { useEffect, useState, useMemo, useCallback } from "react";
import {
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
import AccountCircleRoundedIcon from "@mui/icons-material/AccountCircleRounded";
import IconButton from "@mui/material/IconButton";
import { Chip } from "@heroui/react";
import ReporteClientesDia from "../../Pdf/BotonpdfClientesdia";
import ModalEditarClienteDia from "../../Modal/ModalEditarClienteDia";
import TodosClientes from "./TodosClientes";
import api from "../../../utils/axiosInstance";

// Función para obtener color del sistema
const getColorSistema = () => {
  if (typeof window !== 'undefined') {
    return getComputedStyle(document.documentElement).getPropertyValue('--color-botones').trim() || '#D72838';
  }
  return '#D72838';
};

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
  const [sortDescriptor] = useState({
    column: "nombre",
    direction: "ascending",
  });

  // Ordenamiento mantenido para funcionalidad futura
  // const allowedSortFields = useMemo(
  //   () => new Set(["nombre", "horaInicio", "metododePago"]),
  //   []
  // );

  // const handleSortChange = useCallback(
  //   (descriptor) => {
  //     if (!descriptor || !descriptor.column) return;
  //     if (allowedSortFields.has(descriptor.column)) {
  //       setSortDescriptor(descriptor);
  //     }
  //   },
  //   [allowedSortFields]
  // );

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

      {isLoading ? (
        <div className="flex items-center justify-center h-64 bg-white rounded-xl">
          <CircularProgress aria-label="Cargando..." size="lg" color="default" />
        </div>
      ) : sortedItems.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
          <p className="text-gray-500 text-sm">Inscriba los Clientes de hoy</p>
        </div>
      ) : (
        <>
          {/* Vista de Cards Grid más pequeña */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 lg:gap-4">
            {sortedItems.map((cliente) => (
              <div 
                key={cliente._id || cliente.nombre} 
                className="bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200 border border-gray-200 overflow-hidden"
              >
                {/* Barra superior con color */}
                <div className="h-1 bg-gradient-to-r from-color-botones to-red-600" />
                
                {/* Contenido de la card */}
                <div className="p-3">
                  {/* Nombre */}
                  <div className="flex items-center gap-2 mb-2">
                    <AccountCircleRoundedIcon sx={{ color: "#555", fontSize: 28 }} className="flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm text-gray-900 truncate">{cliente.nombre || "Sin nombre"}</h3>
                    </div>
                  </div>

                  {/* Información en grid compacto */}
                  <div className="grid grid-cols-2 gap-2 mb-2">
                    {cliente.tipoDocumento && cliente.numeroDocumento && (
                      <div className="bg-gray-50 rounded-md p-2 border border-gray-100">
                        <span className="text-[9px] text-gray-500 block mb-0.5">Documento</span>
                        <Chip 
                          color={cliente.tipoDocumento === "DNI" ? "primary" : "secondary"} 
                          variant="flat"
                          size="sm"
                          className="text-[9px] h-4"
                        >
                          {cliente.tipoDocumento === "CE" ? "CE" : cliente.tipoDocumento}
                        </Chip>
                        <span className="text-[8px] text-gray-600 block mt-0.5 truncate">
                          {cliente.numeroDocumento}
                        </span>
                      </div>
                    )}
                    
                    <div className="bg-gray-50 rounded-md p-2 border border-gray-100">
                      <span className="text-[9px] text-gray-500 block mb-0.5">Fecha</span>
                      <span className="text-xs font-medium text-gray-800">
                        {cliente.fecha ? new Date(cliente.fecha).toLocaleDateString("es-PE", { day: "2-digit", month: "2-digit" }) : "Sin fecha"}
                      </span>
                    </div>
                    
                    <div className="bg-gray-50 rounded-md p-2 border border-gray-100">
                      <span className="text-[9px] text-gray-500 block mb-0.5">Hora</span>
                      <span className="text-xs font-medium text-gray-800">{formatTime12Hour(cliente.horaInicio)}</span>
                    </div>
                    
                    <div className="bg-gray-50 rounded-md p-2 border border-gray-100">
                      <span className="text-[9px] text-gray-500 block mb-0.5">Monto</span>
                      <span className="text-xs font-bold text-gray-900">S/ {cliente.monto ?? 7}</span>
                    </div>
                  </div>

                  {/* Método de pago y creador */}
                  <div className="flex items-center justify-between mb-2 text-xs">
                    <div className="flex items-center gap-1.5">
                      <span className="text-gray-500">Pago:</span>
                      {cliente.metododePago && metodosPago[cliente.metododePago.toLowerCase()] && (
                        cliente.metododePago.toLowerCase() === 'efectivo' ? (
                          <div className="p-0.5 cursor-default">
                            <img
                              src={metodosPago[cliente.metododePago.toLowerCase()].icono}
                              alt={metodosPago[cliente.metododePago.toLowerCase()].nombre}
                              className="object-contain w-5 h-5 opacity-80"
                            />
                          </div>
                        ) : (
                          <Button
                            isIconOnly
                            size="sm"
                            onClick={() => openComprobanteModal(cliente)}
                            className="p-0.5 bg-transparent hover:opacity-80 min-w-0 w-auto h-auto"
                          >
                            <img
                              src={metodosPago[cliente.metododePago.toLowerCase()].icono}
                              alt={metodosPago[cliente.metododePago.toLowerCase()].nombre}
                              className="object-contain w-5 h-5"
                            />
                          </Button>
                        )
                      )}
                    </div>
                    {cliente.creadoPor && (
                      <span className="text-[9px] text-gray-500">
                        {cliente.creadoPor === "admin"
                          ? "Admin"
                          : cliente.creadoPor === "trabajador"
                          ? (cliente.creadorNombre || "Trabajador").substring(0, 8)
                          : ""}
                      </span>
                    )}
                  </div>

                  {/* Acciones */}
                  <div className="flex items-center justify-center gap-1.5 pt-2 border-t border-gray-200">
                    <IconButton
                      aria-label="Descargar voucher"
                      onClick={() => descargarVoucher(cliente)}
                      sx={{ color: getColorSistema(), "&:hover": { opacity: 0.8 }, p: 0.5 }}
                      size="small"
                    >
                      <AdfScannerRoundedIcon sx={{ fontSize: 18 }} />
                    </IconButton>
                    <IconButton
                      aria-label="Editar cliente"
                      onClick={() => openModalEditar(cliente)}
                      sx={{ color: getColorSistema(), "&:hover": { opacity: 0.8 }, p: 0.5 }}
                      size="small"
                    >
                      <EditIcon sx={{ fontSize: 18 }} />
                    </IconButton>
                    <IconButton
                      aria-label="Eliminar cliente"
                      onClick={() => handleDeleteConfirm(cliente)}
                      sx={{ color: getColorSistema(), "&:hover": { opacity: 0.8 }, p: 0.5 }}
                      size="small"
                    >
                      <DeleteIcon sx={{ fontSize: 18 }} />
                    </IconButton>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Paginación */}
          {pages > 1 && (
            <div className="flex justify-center mt-4">
              <Pagination
                isCompact
                showControls
                color="primary"
                page={page}
                total={pages}
                onChange={(p) => setPage(p)}
                size="sm"
              />
            </div>
          )}
        </>
      )}

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
