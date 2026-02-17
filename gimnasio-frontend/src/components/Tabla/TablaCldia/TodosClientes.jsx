import React, { useEffect, useState, useMemo, useCallback } from "react";
import {
  Pagination,
  Button,
  Alert,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Chip,
} from "@heroui/react";
import SkeletonCard from "../../Skeleton/SkeletonCard";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import AdfScannerRoundedIcon from "@mui/icons-material/AdfScannerRounded";
import RepeatIcon from "@mui/icons-material/Repeat";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ViewListIcon from "@mui/icons-material/ViewList";
import ViewModuleIcon from "@mui/icons-material/ViewModule";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import TableChartIcon from "@mui/icons-material/TableChart";
import AccountCircleRoundedIcon from "@mui/icons-material/AccountCircleRounded";
import IconButton from "@mui/material/IconButton";
import ModalEditarClienteDia from "../../Modal/ModalEditarClienteDia";
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

export default function TodosClientes({ refresh, mostrarTitulo = true, onClienteEliminado }) {
  const [clientes, setClientes] = useState([]);
  const [clientesAgrupados, setClientesAgrupados] = useState([]);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [userRol, setUserRol] = useState(null);
  const [vistaAgrupada, setVistaAgrupada] = useState(true); // Nueva opción para vista agrupada
  const [clientesExpandidos, setClientesExpandidos] = useState(new Set()); // Clientes con detalles expandidos
  const [sortDescriptor] = useState({
    column: "fecha",
    direction: "descending",
  });
  const [filtroRepetidos, setFiltroRepetidos] = useState("todos"); // "todos", "repetidos", "unicos"

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

  const rowsPerPage = 4;

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

  // 🔹 Descargar reporte PDF de clientes constantes
  const descargarReportePDF = async () => {
    try {
      showAlert("info", "Generando reporte PDF...");
      const response = await api.get("/pdfdia/reporte-clientes-constantes-pdf", {
        responseType: "blob",
        withCredentials: true,
        headers: { Accept: "application/pdf" },
      });

      const blob = response.data;
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `reporte_clientes_constantes.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      showAlert("success", "Reporte PDF descargado exitosamente.");
    } catch (error) {
      console.error("Error al descargar reporte PDF:", error);
      showAlert("danger", "No se pudo generar el reporte PDF.");
    }
  };

  // 🔹 Descargar reporte Excel de clientes constantes
  const descargarReporteExcel = async () => {
    try {
      showAlert("info", "Generando reporte Excel...");
      const response = await api.get("/pdfdia/reporte-clientes-constantes-excel", {
        responseType: "blob",
        withCredentials: true,
        headers: { 
          Accept: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" 
        },
      });

      const blob = response.data;
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `reporte_clientes_constantes.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      showAlert("success", "Reporte Excel descargado exitosamente.");
    } catch (error) {
      console.error("Error al descargar reporte Excel:", error);
      showAlert("danger", "No se pudo generar el reporte Excel.");
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

  // Obtener rol del usuario
  useEffect(() => {
    const rol = sessionStorage.getItem('rol');
    setUserRol(rol);
  }, []);

  // Resetear página y clientes expandidos al cambiar de vista
  useEffect(() => {
    setPage(1);
    setClientesExpandidos(new Set());
  }, [vistaAgrupada]);

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
      // Si hay callback para refrescar clientes de hoy, ejecutarlo
      if (onClienteEliminado && typeof onClienteEliminado === 'function') {
        onClienteEliminado();
      }
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

  // 🔹 Agrupar clientes por nombre/documento para vista agrupada
  const clientesAgrupadosVista = useMemo(() => {
    if (!vistaAgrupada) return null;
    
    const grupos = {};
    
    clientesFiltrados.forEach(cliente => {
      const clave = cliente.numeroDocumento 
        ? `${cliente.nombre.toLowerCase().trim()}_${cliente.tipoDocumento}_${cliente.numeroDocumento.trim()}`
        : `${cliente.nombre.toLowerCase().trim()}_sin_doc`;
      
      if (!grupos[clave]) {
        grupos[clave] = {
          clave,
          nombre: cliente.nombre,
          tipoDocumento: cliente.tipoDocumento,
          numeroDocumento: cliente.numeroDocumento,
          visitas: [],
          totalVisitas: 0,
          totalMonto: 0,
          ultimaVisita: null,
          primerVisita: null,
          metodosPago: new Set(),
          esRepetido: false
        };
      }
      
      grupos[clave].visitas.push(cliente);
      grupos[clave].totalVisitas++;
      grupos[clave].totalMonto += (cliente.monto ?? 7);
      if (cliente.metododePago) grupos[clave].metodosPago.add(cliente.metododePago);
      
      const fechaCliente = new Date(cliente.fecha || cliente.createdAt);
      if (!grupos[clave].ultimaVisita || fechaCliente > grupos[clave].ultimaVisita.fecha) {
        grupos[clave].ultimaVisita = { ...cliente, fecha: fechaCliente };
      }
      if (!grupos[clave].primerVisita || fechaCliente < grupos[clave].primerVisita.fecha) {
        grupos[clave].primerVisita = { ...cliente, fecha: fechaCliente };
      }
    });
    
    // Marcar como repetidos y ordenar visitas dentro de cada grupo (más reciente primero)
    Object.keys(grupos).forEach(clave => {
      if (grupos[clave].totalVisitas > 1) {
        grupos[clave].esRepetido = true;
      }
      // Ordenar visitas por fecha (más reciente primero)
      grupos[clave].visitas.sort((a, b) => {
        const fechaA = new Date(a.fecha || a.createdAt || 0);
        const fechaB = new Date(b.fecha || b.createdAt || 0);
        return fechaB - fechaA;
      });
    });
    
    return Object.values(grupos);
  }, [clientesFiltrados, vistaAgrupada]);

  // Función para expandir/colapsar cliente
  const toggleExpandirCliente = (clave) => {
    const nuevosExpandidos = new Set(clientesExpandidos);
    if (nuevosExpandidos.has(clave)) {
      nuevosExpandidos.delete(clave);
    } else {
      nuevosExpandidos.add(clave);
    }
    setClientesExpandidos(nuevosExpandidos);
  };

  // Items para mostrar: agrupados o individuales
  const itemsParaMostrar = vistaAgrupada ? clientesAgrupadosVista : clientesFiltrados;
  const pages = Math.ceil((itemsParaMostrar?.length || 0) / rowsPerPage);
  const items = useMemo(() => {
    if (!itemsParaMostrar) return [];
    const start = (page - 1) * rowsPerPage;
    return itemsParaMostrar.slice(start, start + rowsPerPage);
  }, [page, itemsParaMostrar]);

  const sortedItems = useMemo(() => {
    if (vistaAgrupada) {
      // Ordenar grupos por última visita (más reciente primero)
      const gruposOrdenados = [...items].sort((a, b) => {
        const fechaA = a.ultimaVisita?.fecha || new Date(0);
        const fechaB = b.ultimaVisita?.fecha || new Date(0);
        return fechaB - fechaA; // Más reciente primero
      });
      
      // Expandir grupos para incluir filas expandidas
      const itemsExpandidos = [];
      gruposOrdenados.forEach((grupo) => {
        // Agregar la fila principal del grupo
        itemsExpandidos.push({ ...grupo, esGrupoPrincipal: true });
        
        // Si el grupo está expandido, agregar las visitas como filas separadas
        if (clientesExpandidos.has(grupo.clave)) {
          grupo.visitas.forEach((visita, idx) => {
            itemsExpandidos.push({
              ...visita,
              esVisitaExpandida: true,
              grupoPadre: grupo.clave,
              indiceVisita: idx
            });
          });
        }
      });
      
      return itemsExpandidos;
    } else {
      // Ordenar visitas individuales
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
    }
  }, [sortDescriptor, items, vistaAgrupada, clientesExpandidos]);

  const totalMonto = useMemo(
    () => {
      if (!Array.isArray(clientesFiltrados)) return 0;
      return clientesFiltrados.reduce((acc, cliente) => acc + (cliente.monto != null ? cliente.monto : 7), 0);
    },
    [clientesFiltrados]
  );

  // Calcular total de clientes únicos cuando está en vista agrupada
  const totalClientesUnicos = vistaAgrupada 
    ? (clientesAgrupadosVista?.length || 0)
    : clientesFiltrados.length;

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
          {userRol === 'admin' && (
            <>
              <Button
                size="sm"
                variant="solid"
                color="danger"
                onPress={descargarReportePDF}
                className="text-xs sm:text-sm"
                startContent={<PictureAsPdfIcon sx={{ fontSize: 16 }} />}
              >
                <span className="hidden sm:inline">Descargar PDF</span>
                <span className="sm:hidden">PDF</span>
              </Button>
              <Button
                size="sm"
                variant="solid"
                color="success"
                onPress={descargarReporteExcel}
                className="text-xs sm:text-sm"
                startContent={<TableChartIcon sx={{ fontSize: 16 }} />}
              >
                <span className="hidden sm:inline">Descargar Excel</span>
                <span className="sm:hidden">Excel</span>
              </Button>
            </>
          )}
          <Button
            size="sm"
            variant={vistaAgrupada ? "solid" : "flat"}
            color={vistaAgrupada ? "secondary" : "default"}
            onPress={() => setVistaAgrupada(!vistaAgrupada)}
            className="text-xs sm:text-sm"
            startContent={vistaAgrupada ? <ViewModuleIcon sx={{ fontSize: 16 }} /> : <ViewListIcon sx={{ fontSize: 16 }} />}
          >
            {vistaAgrupada ? "Vista Agrupada" : "Vista Detallada"}
          </Button>
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
          {userRol === 'admin' && (
            <>
              <Button
                size="sm"
                variant="solid"
                color="danger"
                onPress={descargarReportePDF}
                className="text-xs sm:text-sm"
                startContent={<PictureAsPdfIcon sx={{ fontSize: 16 }} />}
              >
                <span className="hidden sm:inline">Descargar PDF</span>
                <span className="sm:hidden">PDF</span>
              </Button>
              <Button
                size="sm"
                variant="solid"
                color="success"
                onPress={descargarReporteExcel}
                className="text-xs sm:text-sm"
                startContent={<TableChartIcon sx={{ fontSize: 16 }} />}
              >
                <span className="hidden sm:inline">Descargar Excel</span>
                <span className="sm:hidden">Excel</span>
              </Button>
            </>
          )}
          <Button
            size="sm"
            variant={vistaAgrupada ? "solid" : "flat"}
            color={vistaAgrupada ? "secondary" : "default"}
            onPress={() => setVistaAgrupada(!vistaAgrupada)}
            className="text-xs sm:text-sm"
            startContent={vistaAgrupada ? <ViewModuleIcon sx={{ fontSize: 16 }} /> : <ViewListIcon sx={{ fontSize: 16 }} />}
          >
            {vistaAgrupada ? "Vista Agrupada" : "Vista Detallada"}
          </Button>
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

      {isLoading ? (
        <SkeletonCard count={4} />
      ) : sortedItems.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
          <p className="text-gray-500 text-sm">No hay clientes registrados</p>
        </div>
      ) : (
        <>
          {/* Vista de Cards Grid más pequeña y minimalista */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-2">
            {sortedItems.map((item) => {
              // Si es una visita expandida en vista agrupada
              if (vistaAgrupada && item.esVisitaExpandida) {
                const puedeEliminar = userRol === 'admin';
                return (
                  <div 
                    key={`${item.grupoPadre}-${item.indiceVisita}`}
                    className="bg-gray-50 rounded-md shadow-sm border border-gray-200 overflow-hidden ml-4"
                  >
                    <div className="h-0.5 bg-gradient-to-r from-gray-400 to-gray-500" />
                    <div className="p-2">
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <AccountCircleRoundedIcon sx={{ color: "#555", fontSize: 18 }} />
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-[10px] text-gray-700 truncate">{item.nombre || "Sin nombre"}</h3>
                          <Chip size="sm" color="secondary" variant="flat" className="text-[8px] h-3 mt-0.5">
                            #{item.indiceVisita + 1}
                          </Chip>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-1.5 mb-1.5">
                        <div className="bg-white rounded p-1.5 border border-gray-100">
                          <span className="text-[8px] text-gray-500 block mb-0.5">Fecha</span>
                          <span className="text-[10px] font-medium text-gray-800">
                            {item.fecha ? new Date(item.fecha).toLocaleDateString("es-PE", { day: "2-digit", month: "2-digit" }) : "-"}
                          </span>
                        </div>
                        <div className="bg-white rounded p-1.5 border border-gray-100">
                          <span className="text-[8px] text-gray-500 block mb-0.5">Hora</span>
                          <span className="text-[10px] font-medium text-gray-800">{formatTime12Hour(item.horaInicio)}</span>
                        </div>
                        <div className="bg-white rounded p-1.5 border border-gray-100">
                          <span className="text-[8px] text-gray-500 block mb-0.5">Monto</span>
                          <span className="text-[10px] font-bold text-gray-900">S/ {item.monto ?? 7}</span>
                        </div>
                        <div className="bg-white rounded p-1.5 border border-gray-100">
                          <span className="text-[8px] text-gray-500 block mb-0.5">Pago</span>
                          <div className="flex items-center justify-center h-full">
                            {item.metododePago && metodosPago[item.metododePago.toLowerCase()] ? (
                              item.metododePago.toLowerCase() === 'efectivo' ? (
                                <img
                                  src={metodosPago[item.metododePago.toLowerCase()].icono}
                                  alt={metodosPago[item.metododePago.toLowerCase()].nombre}
                                  className="object-contain w-4 h-4 opacity-80"
                                />
                              ) : (
                                <Button
                                  isIconOnly
                                  size="sm"
                                  onClick={() => openComprobanteModal(item)}
                                  className="p-0.5 bg-transparent hover:opacity-80 min-w-0 w-auto h-auto"
                                >
                                  <img
                                    src={metodosPago[item.metododePago.toLowerCase()].icono}
                                    alt={metodosPago[item.metododePago.toLowerCase()].nombre}
                                    className="object-contain w-4 h-4"
                                  />
                                </Button>
                              )
                            ) : (
                              <span className="text-gray-400 text-[8px]">-</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center justify-center gap-1 pt-1.5 border-t border-gray-200">
                        <IconButton
                          aria-label="Descargar voucher"
                          onClick={() => descargarVoucher(item)}
                          sx={{ color: getColorSistema(), fontSize: 16, cursor: "pointer", "&:hover": { opacity: 0.8 } }}
                          size="small"
                        >
                          <AdfScannerRoundedIcon fontSize="inherit" />
                        </IconButton>
                        <IconButton
                          aria-label="Editar cliente"
                          onClick={() => openModalEditar(item)}
                          sx={{ color: getColorSistema(), fontSize: 16, cursor: "pointer", "&:hover": { opacity: 0.8 } }}
                          size="small"
                        >
                          <EditIcon fontSize="inherit" />
                        </IconButton>
                        {puedeEliminar && (
                          <IconButton
                            aria-label="Eliminar cliente"
                            onClick={() => handleDeleteConfirm(item)}
                            sx={{ color: getColorSistema(), fontSize: 16, cursor: "pointer", "&:hover": { opacity: 0.8 } }}
                            size="small"
                          >
                            <DeleteIcon fontSize="inherit" />
                          </IconButton>
                        )}
                      </div>
                    </div>
                  </div>
                );
              }

              // Vista agrupada - grupo principal
              if (vistaAgrupada && item.esGrupoPrincipal) {
                const grupo = item;
                const estaExpandido = clientesExpandidos.has(grupo.clave);
                const puedeEliminar = userRol === 'admin';
                
                return (
                  <div 
                    key={grupo.clave}
                    className={`bg-white rounded-md shadow-sm hover:shadow-md transition-all duration-200 border border-gray-200 overflow-hidden ${grupo.esRepetido ? 'ring-1 ring-yellow-300' : ''}`}
                  >
                    <div className={`h-0.5 ${grupo.esRepetido ? 'bg-gradient-to-r from-yellow-500 to-orange-500' : 'bg-gradient-to-r from-color-botones to-red-600'}`} />
                    <div className="p-2">
                      <div className="flex items-start justify-between mb-1.5">
                        <div className="flex items-center gap-1.5 flex-1 min-w-0">
                          <AccountCircleRoundedIcon sx={{ color: "#555", fontSize: 20 }} className="flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium text-xs text-gray-900 truncate mb-0.5">{grupo.nombre || "Sin nombre"}</h3>
                            {grupo.tipoDocumento && grupo.numeroDocumento && (
                              <div className="flex items-center gap-1">
                                <Chip 
                                  color={grupo.tipoDocumento === "DNI" ? "primary" : "secondary"} 
                                  variant="flat"
                                  size="sm"
                                  className="text-[8px] h-3"
                                >
                                  {grupo.tipoDocumento === "CE" ? "CE" : grupo.tipoDocumento}
                                </Chip>
                                <span className="text-[8px] text-gray-600 truncate">{grupo.numeroDocumento}</span>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-0.5">
                          {grupo.esRepetido && (
                            <Chip size="sm" color="warning" variant="flat" className="text-[8px] h-4">
                              <RepeatIcon sx={{ fontSize: 10, mr: 0.5 }} />
                              {grupo.totalVisitas}x
                            </Chip>
                          )}
                          <Chip size="sm" color={grupo.totalVisitas > 1 ? "warning" : "default"} variant="flat" className="text-[8px] h-4">
                            {grupo.totalVisitas} visita{grupo.totalVisitas > 1 ? 's' : ''}
                          </Chip>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-1.5 mb-1.5">
                        <div className="bg-gray-50 rounded p-1.5 border border-gray-100">
                          <span className="text-[8px] text-gray-500 block mb-0.5">Última Visita</span>
                          <span className="text-[10px] font-medium text-gray-800">
                            {grupo.ultimaVisita?.fecha ? new Date(grupo.ultimaVisita.fecha).toLocaleDateString("es-PE", { day: "2-digit", month: "2-digit" }) : "-"}
                          </span>
                          <span className="text-[8px] text-gray-500 block">{formatTime12Hour(grupo.ultimaVisita?.horaInicio)}</span>
                        </div>
                        <div className="bg-gray-50 rounded p-1.5 border border-gray-100">
                          <span className="text-[8px] text-gray-500 block mb-0.5">Total Gastado</span>
                          <span className="text-[10px] font-bold text-gray-900">S/ {grupo.totalMonto.toFixed(2)}</span>
                        </div>
                        <div className="bg-gray-50 rounded p-1.5 border border-gray-100 col-span-2">
                          <span className="text-[8px] text-gray-500 block mb-0.5">Métodos de Pago</span>
                          <div className="flex items-center gap-1 flex-wrap">
                            {Array.from(grupo.metodosPago).slice(0, 3).map((metodo) => (
                              metodosPago[metodo.toLowerCase()] && (
                                <img
                                  key={metodo}
                                  src={metodosPago[metodo.toLowerCase()].icono}
                                  alt={metodo}
                                  className="object-contain w-4 h-4"
                                  title={metodo}
                                />
                              )
                            ))}
                            {grupo.metodosPago.size > 3 && (
                              <span className="text-[8px] text-gray-500">+{grupo.metodosPago.size - 3}</span>
                            )}
                          </div>
                        </div>
                      </div>

                      {grupo.totalVisitas > 1 && (
                        <div className="mb-1.5">
                          <Button
                            size="sm"
                            variant="flat"
                            onClick={() => toggleExpandirCliente(grupo.clave)}
                            className="w-full text-[10px] h-6"
                            startContent={estaExpandido ? <ExpandLessIcon sx={{ fontSize: 14 }} /> : <ExpandMoreIcon sx={{ fontSize: 14 }} />}
                          >
                            {estaExpandido ? 'Ocultar' : `Ver ${grupo.totalVisitas}`}
                          </Button>
                        </div>
                      )}

                      <div className="flex items-center justify-center gap-1 pt-1.5 border-t border-gray-200">
                        {grupo.ultimaVisita && (
                          <>
                            <IconButton
                              aria-label="Descargar voucher"
                              onClick={() => descargarVoucher(grupo.ultimaVisita)}
                              sx={{ color: getColorSistema(), fontSize: 16, cursor: "pointer", "&:hover": { opacity: 0.8 } }}
                              size="small"
                            >
                              <AdfScannerRoundedIcon fontSize="inherit" />
                            </IconButton>
                            <IconButton
                              aria-label="Editar cliente"
                              onClick={() => openModalEditar(grupo.ultimaVisita)}
                              sx={{ color: getColorSistema(), fontSize: 16, cursor: "pointer", "&:hover": { opacity: 0.8 } }}
                              size="small"
                            >
                              <EditIcon fontSize="inherit" />
                            </IconButton>
                            {puedeEliminar && (
                              <IconButton
                                aria-label="Eliminar cliente"
                                onClick={() => handleDeleteConfirm(grupo.ultimaVisita)}
                                sx={{ color: getColorSistema(), fontSize: 16, cursor: "pointer", "&:hover": { opacity: 0.8 } }}
                                size="small"
                              >
                                <DeleteIcon fontSize="inherit" />
                              </IconButton>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              }

              // Vista detallada - cliente individual
              const cliente = item;
              const esRepetido = esClienteRepetido(cliente);
              const numVisitas = obtenerNumeroVisitas(cliente);
              const puedeEliminar = userRol === 'admin';
              
              return (
                <div 
                  key={cliente._id || cliente.nombre}
                  className={`bg-white rounded-md shadow-sm hover:shadow-md transition-all duration-200 border border-gray-200 overflow-hidden ${esRepetido ? 'ring-1 ring-yellow-300' : ''}`}
                >
                  <div className={`h-0.5 ${esRepetido ? 'bg-gradient-to-r from-yellow-500 to-orange-500' : 'bg-gradient-to-r from-color-botones to-red-600'}`} />
                  <div className="p-2">
                    <div className="flex items-start justify-between mb-1.5">
                      <div className="flex items-center gap-1.5 flex-1 min-w-0">
                        <AccountCircleRoundedIcon sx={{ color: "#555", fontSize: 20 }} className="flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-xs text-gray-900 truncate mb-0.5">{cliente.nombre || "Sin nombre"}</h3>
                          {cliente.tipoDocumento && cliente.numeroDocumento && (
                            <div className="flex items-center gap-1">
                              <Chip 
                                color={cliente.tipoDocumento === "DNI" ? "primary" : "secondary"} 
                                variant="flat"
                                size="sm"
                                className="text-[8px] h-3"
                              >
                                {cliente.tipoDocumento === "CE" ? "CE" : cliente.tipoDocumento}
                              </Chip>
                              <span className="text-[8px] text-gray-600 truncate">{cliente.numeroDocumento}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-0.5">
                        {esRepetido && (
                          <Chip size="sm" color="warning" variant="flat" className="text-[8px] h-4">
                            <RepeatIcon sx={{ fontSize: 10, mr: 0.5 }} />
                            {numVisitas}x
                          </Chip>
                        )}
                        <Chip size="sm" color={numVisitas > 1 ? "warning" : "default"} variant="flat" className="text-[8px] h-4">
                          {numVisitas} visita{numVisitas > 1 ? 's' : ''}
                        </Chip>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-1.5 mb-1.5">
                      <div className="bg-gray-50 rounded p-1.5 border border-gray-100">
                        <span className="text-[8px] text-gray-500 block mb-0.5">Fecha</span>
                        <span className="text-[10px] font-medium text-gray-800">
                          {cliente.fecha ? new Date(cliente.fecha).toLocaleDateString("es-PE", { day: "2-digit", month: "2-digit" }) : "-"}
                        </span>
                      </div>
                      <div className="bg-gray-50 rounded p-1.5 border border-gray-100">
                        <span className="text-[8px] text-gray-500 block mb-0.5">Hora</span>
                        <span className="text-[10px] font-medium text-gray-800">{formatTime12Hour(cliente.horaInicio)}</span>
                      </div>
                      <div className="bg-gray-50 rounded p-1.5 border border-gray-100">
                        <span className="text-[8px] text-gray-500 block mb-0.5">Monto</span>
                        <span className="text-[10px] font-bold text-gray-900">S/ {cliente.monto ?? 7}</span>
                      </div>
                      <div className="bg-gray-50 rounded p-1.5 border border-gray-100">
                        <span className="text-[8px] text-gray-500 block mb-0.5">Pago</span>
                        <div className="flex items-center justify-center h-full">
                          {cliente.metododePago && metodosPago[cliente.metododePago.toLowerCase()] ? (
                            cliente.metododePago.toLowerCase() === 'efectivo' ? (
                              <img
                                src={metodosPago[cliente.metododePago.toLowerCase()].icono}
                                alt={metodosPago[cliente.metododePago.toLowerCase()].nombre}
                                className="object-contain w-4 h-4 opacity-80"
                              />
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
                                  className="object-contain w-4 h-4"
                                />
                              </Button>
                            )
                          ) : (
                            <span className="text-gray-400 text-[8px]">-</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mb-1.5 text-[9px]">
                      <span className="text-[8px] text-gray-500">
                        {cliente.creadoPor === "admin" ? "Admin" : (cliente.creadorNombre || "Trab").substring(0, 6)}
                      </span>
                    </div>

                    <div className="flex items-center justify-center gap-1 pt-1.5 border-t border-gray-200">
                      <IconButton
                        aria-label="Descargar voucher"
                        onClick={() => descargarVoucher(cliente)}
                        sx={{ color: getColorSistema(), fontSize: 16, cursor: "pointer", "&:hover": { opacity: 0.8 } }}
                        size="small"
                      >
                        <AdfScannerRoundedIcon fontSize="inherit" />
                      </IconButton>
                      <IconButton
                        aria-label="Editar cliente"
                        onClick={() => openModalEditar(cliente)}
                        sx={{ color: getColorSistema(), fontSize: 16, cursor: "pointer", "&:hover": { opacity: 0.8 } }}
                        size="small"
                      >
                        <EditIcon fontSize="inherit" />
                      </IconButton>
                      {puedeEliminar && (
                        <IconButton
                          aria-label="Eliminar cliente"
                          onClick={() => handleDeleteConfirm(cliente)}
                          sx={{ color: getColorSistema(), fontSize: 16, cursor: "pointer", "&:hover": { opacity: 0.8 } }}
                          size="small"
                        >
                          <DeleteIcon fontSize="inherit" />
                        </IconButton>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
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
          Total Recaudado: <span className="text-color-acentos">S/ {totalMonto.toFixed(2)}</span>
        </div>
        <div className="text-sm text-gray-600">
          {vistaAgrupada ? (
            <>Mostrando {totalClientesUnicos} {totalClientesUnicos === 1 ? 'cliente único' : 'clientes únicos'} de {clientes.length} {clientes.length === 1 ? 'visita total' : 'visitas totales'}</>
          ) : (
            <>Mostrando {clientesFiltrados.length} de {clientes.length} clientes</>
          )}
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
          <ModalHeader className="text-lg font-semibold text-color-acentos">
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

