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
  Chip,
} from "@heroui/react";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import AdfScannerRoundedIcon from "@mui/icons-material/AdfScannerRounded";
import RepeatIcon from "@mui/icons-material/Repeat";
import IconButton from "@mui/material/IconButton";
import ModalEditarClienteDia from "../../Modal/ModalEditarClienteDia";
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

export default function TodosClientes({ refresh, mostrarTitulo = true }) {
  const [clientes, setClientes] = useState([]);
  const [clientesAgrupados, setClientesAgrupados] = useState([]);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [sortDescriptor, setSortDescriptor] = useState({
    column: "fecha",
    direction: "descending",
  });
  const [filtroRepetidos, setFiltroRepetidos] = useState("todos"); // "todos", "repetidos", "unicos"

  const allowedSortFields = useMemo(
    () => new Set(["nombre", "fecha", "horaInicio", "metododePago"]),
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
    let comprobanteUrl = null;
    
    if (cliente.comprobante) {
      comprobanteUrl = cliente.comprobante;
    } else if (cliente.fotocomprobante?.data) {
      const fc = cliente.fotocomprobante;
      if (typeof fc.data === 'string') {
        comprobanteUrl = fc.data.startsWith('data:') ? fc.data : `data:${fc.contentType || 'image/jpeg'};base64,${fc.data}`;
      } else if (fc.data.type === 'Buffer' && Array.isArray(fc.data.data)) {
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

  const rowsPerPage = 10;

  // 🔹 Función para verificar si un cliente es repetido
  const esClienteRepetido = useCallback((cliente) => {
    if (!cliente.numeroDocumento) {
      // Si no tiene documento, buscar por nombre
      const clave = `${cliente.nombre.toLowerCase().trim()}_sin_doc`;
      const grupo = clientesAgrupados.find(g => {
        const gClave = g.numeroDocumento 
          ? `${g.nombre.toLowerCase().trim()}_${g.tipoDocumento}_${g.numeroDocumento.trim()}`
          : `${g.nombre.toLowerCase().trim()}_sin_doc`;
        return gClave === clave;
      });
      return grupo && grupo.totalVisitas > 1;
    } else {
      const clave = `${cliente.nombre.toLowerCase().trim()}_${cliente.tipoDocumento}_${cliente.numeroDocumento.trim()}`;
      const grupo = clientesAgrupados.find(g => {
        const gClave = g.numeroDocumento 
          ? `${g.nombre.toLowerCase().trim()}_${g.tipoDocumento}_${g.numeroDocumento.trim()}`
          : `${g.nombre.toLowerCase().trim()}_sin_doc`;
        return gClave === clave;
      });
      return grupo && grupo.totalVisitas > 1;
    }
  }, [clientesAgrupados]);

  // 🔹 Obtener número de visitas de un cliente
  const obtenerNumeroVisitas = useCallback((cliente) => {
    if (!cliente.numeroDocumento) {
      const clave = `${cliente.nombre.toLowerCase().trim()}_sin_doc`;
      const grupo = clientesAgrupados.find(g => {
        const gClave = g.numeroDocumento 
          ? `${g.nombre.toLowerCase().trim()}_${g.tipoDocumento}_${g.numeroDocumento.trim()}`
          : `${g.nombre.toLowerCase().trim()}_sin_doc`;
        return gClave === clave;
      });
      return grupo ? grupo.totalVisitas : 1;
    } else {
      const clave = `${cliente.nombre.toLowerCase().trim()}_${cliente.tipoDocumento}_${cliente.numeroDocumento.trim()}`;
      const grupo = clientesAgrupados.find(g => {
        const gClave = g.numeroDocumento 
          ? `${g.nombre.toLowerCase().trim()}_${g.tipoDocumento}_${g.numeroDocumento.trim()}`
          : `${g.nombre.toLowerCase().trim()}_sin_doc`;
        return gClave === clave;
      });
      return grupo ? grupo.totalVisitas : 1;
    }
  }, [clientesAgrupados]);

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

  // 🔹 Obtener todos los clientes
  const fetchClientes = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await api.get("/visits/todosclientes");
      setClientes(res.data.clientes || []);
      setClientesAgrupados(res.data.clientesAgrupados || []);
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

  // 🔹 Filtrar clientes según el filtro seleccionado
  const clientesFiltrados = useMemo(() => {
    if (filtroRepetidos === "todos") return clientes;
    if (filtroRepetidos === "repetidos") {
      return clientes.filter(cliente => esClienteRepetido(cliente));
    }
    if (filtroRepetidos === "unicos") {
      return clientes.filter(cliente => !esClienteRepetido(cliente));
    }
    return clientes;
  }, [clientes, filtroRepetidos, esClienteRepetido]);

  const pages = Math.ceil(clientesFiltrados.length / rowsPerPage);
  const items = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    return clientesFiltrados.slice(start, start + rowsPerPage);
  }, [page, clientesFiltrados]);

  const sortedItems = useMemo(() => {
    const column = sortDescriptor?.column || "fecha";
    const directionFactor = sortDescriptor?.direction === "descending" ? -1 : 1;
    return [...items].sort((a, b) => {
      let first, second;
      
      if (column === "fecha") {
        first = new Date(a[column] || 0).getTime();
        second = new Date(b[column] || 0).getTime();
        return (first - second) * directionFactor;
      } else {
        first = (a[column] ?? "").toString().toLowerCase();
        second = (b[column] ?? "").toString().toLowerCase();
        if (first < second) return -1 * directionFactor;
        if (first > second) return 1 * directionFactor;
        return 0;
      }
    });
  }, [sortDescriptor, items]);

  const loadingState = isLoading ? "loading" : "idle";

  const totalMonto = useMemo(
    () => {
      if (!Array.isArray(clientesFiltrados)) return 0;
      return clientesFiltrados.reduce((acc, cliente) => acc + (cliente.monto != null ? cliente.monto : 7), 0);
    },
    [clientesFiltrados]
  );

  const clientesRepetidosCount = useMemo(
    () => {
      if (!Array.isArray(clientes)) return 0;
      return clientes.filter(cliente => esClienteRepetido(cliente)).length;
    },
    [clientes, esClienteRepetido]
  );

  if (!Array.isArray(clientes)) return null;

  return (
    <div className={mostrarTitulo ? "p-3 sm:p-4 md:p-6 bg-gray-100 rounded-xl" : ""}>
      {mostrarTitulo ? (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-3 sm:mb-4">
          <h2 className="text-lg sm:text-xl font-bold text-black">Todos los Clientes</h2>
          <div className="flex flex-wrap items-center gap-2">
          <Button
            size="sm"
            variant={filtroRepetidos === "todos" ? "solid" : "flat"}
            color={filtroRepetidos === "todos" ? "primary" : "default"}
            onPress={() => setFiltroRepetidos("todos")}
            className="text-xs sm:text-sm"
          >
            Todos ({clientes.length})
          </Button>
          <Button
            size="sm"
            variant={filtroRepetidos === "repetidos" ? "solid" : "flat"}
            color={filtroRepetidos === "repetidos" ? "warning" : "default"}
            onPress={() => setFiltroRepetidos("repetidos")}
            className="text-xs sm:text-sm"
          >
            <RepeatIcon sx={{ fontSize: 16, mr: 0.5 }} />
            Repetidos ({clientesRepetidosCount})
          </Button>
          <Button
            size="sm"
            variant={filtroRepetidos === "unicos" ? "solid" : "flat"}
            color={filtroRepetidos === "unicos" ? "success" : "default"}
            onPress={() => setFiltroRepetidos("unicos")}
            className="text-xs sm:text-sm"
          >
            Únicos ({clientes.length - clientesRepetidosCount})
          </Button>
          </div>
        </div>
      ) : (
        <div className="flex flex-wrap items-center gap-2 mb-3 sm:mb-4">
          <Button
            size="sm"
            variant={filtroRepetidos === "todos" ? "solid" : "flat"}
            color={filtroRepetidos === "todos" ? "primary" : "default"}
            onPress={() => setFiltroRepetidos("todos")}
            className="text-xs sm:text-sm"
          >
            Todos ({clientes.length})
          </Button>
          <Button
            size="sm"
            variant={filtroRepetidos === "repetidos" ? "solid" : "flat"}
            color={filtroRepetidos === "repetidos" ? "warning" : "default"}
            onPress={() => setFiltroRepetidos("repetidos")}
            className="text-xs sm:text-sm"
          >
            <RepeatIcon sx={{ fontSize: 16, mr: 0.5 }} />
            Repetidos ({clientesRepetidosCount})
          </Button>
          <Button
            size="sm"
            variant={filtroRepetidos === "unicos" ? "solid" : "flat"}
            color={filtroRepetidos === "unicos" ? "success" : "default"}
            onPress={() => setFiltroRepetidos("unicos")}
            className="text-xs sm:text-sm"
          >
            Únicos ({clientes.length - clientesRepetidosCount})
          </Button>
        </div>
      )}

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

      <Table
        aria-label="Tabla de todos los clientes"
        sortDescriptor={sortDescriptor}
        onSortChange={handleSortChange}
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
          base: "bg-white rounded-lg shadow overflow-x-auto",
          th: "text-red-600 font-bold bg-gray-200 text-xs sm:text-sm",
          td: "text-black text-xs sm:text-sm",
        }}
      >
        <TableHeader>
          <TableColumn key="nombre" allowsSorting className="min-w-[120px]">Nombre</TableColumn>
          <TableColumn key="documento" allowsSorting className="min-w-[120px]">Documento</TableColumn>
          <TableColumn key="fecha" allowsSorting className="min-w-[100px]">Fecha</TableColumn>
          <TableColumn key="horaInicio" allowsSorting className="min-w-[100px]">Hora</TableColumn>
          <TableColumn key="metododePago" allowsSorting className="text-center">PAGO</TableColumn>
          <TableColumn key="precio" className="text-right min-w-[80px]" allowsSorting>Monto</TableColumn>
          <TableColumn key="visitas" className="text-center min-w-[80px]">Visitas</TableColumn>
          <TableColumn key="cambios" className="text-center hidden md:table-cell">Cambios</TableColumn>
          <TableColumn key="acciones" className="text-center min-w-[120px]">Acciones</TableColumn>
        </TableHeader>

        <TableBody
          items={sortedItems}
          loadingState={loadingState}
          loadingContent={
            <div className="flex items-center justify-center h-40">
              <CircularProgress aria-label="Cargando..." size="lg" color="default" />
            </div>
          }
          emptyContent={"No hay clientes registrados"}
        >
          {(cliente) => {
            const esRepetido = esClienteRepetido(cliente);
            const numVisitas = obtenerNumeroVisitas(cliente);
            return (
              <TableRow 
                key={cliente._id || cliente.nombre}
                className={esRepetido ? "bg-yellow-50 hover:bg-yellow-100" : ""}
              >
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    {cliente.nombre || "Sin nombre"}
                    {esRepetido && (
                      <Chip
                        size="sm"
                        color="warning"
                        variant="flat"
                        startContent={<RepeatIcon sx={{ fontSize: 14 }} />}
                      >
                        {numVisitas}x
                      </Chip>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  {cliente.tipoDocumento && cliente.numeroDocumento 
                    ? `${cliente.tipoDocumento}: ${cliente.numeroDocumento}` 
                    : "-"}
                </TableCell>
                <TableCell>
                  {cliente.fecha ? new Date(cliente.fecha).toLocaleDateString("es-PE") : "Sin fecha"}
                </TableCell>
                <TableCell>{formatTime12Hour(cliente.horaInicio)}</TableCell>
                <TableCell className="text-center capitalize">
                  <div className="flex items-center justify-center gap-2">
                    {cliente.metododePago && metodosPago[cliente.metododePago.toLowerCase()] && (
                      <>
                        {cliente.metododePago.toLowerCase() === 'efectivo' ? (
                          <div className="p-1 cursor-default">
                            <img
                              src={metodosPago[cliente.metododePago.toLowerCase()].icono}
                              alt={metodosPago[cliente.metododePago.toLowerCase()].nombre}
                              className="object-contain w-6 h-6 opacity-80"
                            />
                          </div>
                        ) : (
                          <Button
                            isIconOnly
                            size="sm"
                            onClick={() => openComprobanteModal(cliente)}
                            className="p-1 bg-transparent hover:opacity-80"
                          >
                            <img
                              src={metodosPago[cliente.metododePago.toLowerCase()].icono}
                              alt={metodosPago[cliente.metododePago.toLowerCase()].nombre}
                              className="object-contain w-6 h-6"
                            />
                          </Button>
                        )}
                      </>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-right font-semibold">{cliente.monto ?? 7}</TableCell>
                <TableCell className="text-center">
                  <Chip
                    size="sm"
                    color={numVisitas > 1 ? "warning" : "default"}
                    variant={numVisitas > 1 ? "flat" : "flat"}
                  >
                    {numVisitas}
                  </Chip>
                </TableCell>
                <TableCell className="text-center hidden md:table-cell">
                  <span className="text-xs sm:text-sm font-normal text-black">
                    {cliente.creadoPor === "admin"
                      ? "Administrador"
                      : cliente.creadoPor === "trabajador"
                      ? cliente.creadorNombre || "Trabajador"
                      : "Desconocido"}
                  </span>
                </TableCell>
                <TableCell className="text-center">
                  <div className="flex items-center justify-center gap-1 sm:gap-2 md:gap-3">
                    <IconButton
                      aria-label="Descargar voucher"
                      onClick={() => descargarVoucher(cliente)}
                      sx={{ color: "#d32f2f", "&:hover": { color: "#9a1b1b" }, p: 0.5 }}
                      size="small"
                    >
                      <AdfScannerRoundedIcon sx={{ fontSize: { xs: 20, sm: 24, md: 26 } }} />
                    </IconButton>

                    <IconButton
                      aria-label="Editar cliente"
                      onClick={() => openModalEditar(cliente)}
                      sx={{ color: "#d32f2f", "&:hover": { color: "#9a1b1b" }, p: 0.5 }}
                      size="small"
                    >
                      <EditIcon sx={{ fontSize: { xs: 20, sm: 24, md: 26 } }} />
                    </IconButton>

                    <IconButton
                      aria-label="Eliminar cliente"
                      color="error"
                      onClick={() => handleDeleteConfirm(cliente)}
                      sx={{ p: 0.5 }}
                      size="small"
                    >
                      <DeleteIcon sx={{ fontSize: { xs: 20, sm: 24, md: 26 } }} />
                    </IconButton>
                  </div>
                </TableCell>
              </TableRow>
            );
          }}
        </TableBody>
      </Table>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-0 mt-4">
        <div className="text-base sm:text-lg font-bold text-black">
          Total Recaudado: <span className="text-red-600">S/ {totalMonto.toFixed(2)}</span>
        </div>
        <div className="text-sm text-gray-600">
          Mostrando {clientesFiltrados.length} de {clientes.length} clientes
        </div>
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

