import React, { useEffect, useMemo, useState, useCallback, useRef } from "react"; 
import {Pagination} from "@heroui/pagination";
import api from "../../../utils/axiosInstance";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Input,
  Chip,
  Spinner,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Button,
} from "@nextui-org/react";
import { Alert, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from "@heroui/react";
import ActualizarSuscripcion from "../../Actualizarmodal/ActualizarSuscripciones";
import SearchIcon from "@mui/icons-material/Search";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import AccountCircleRoundedIcon from "@mui/icons-material/AccountCircleRounded";
import AdfScannerRoundedIcon from "@mui/icons-material/AdfScannerRounded";
import BotonEditar from "../../Iconos/BotonEditar";
import BotonRenovar from "../../Iconos/BotonRenovar";
import BotonEditarDeuda from "../../Iconos/BotonEditarDeuda";
import EditarDeuda from "../../Modal/ActualizarModal/EditarDeuda";

const metodosPago = {
  yape: { nombre: "Yape", color: "bg-purple-700", icono: "/iconos/yape.png" },
  plin: { nombre: "Plin", color: "bg-blue-600", icono: "/iconos/plin.png" },
  efectivo: { nombre: "Efectivo", color: "bg-green-600", icono: "/iconos/eefctivo.png" },
}; 

export default function TablaClientesAdmin({ refresh }) {
  const [miembros, setMiembros] = useState([]);
  const [filtro, setFiltro] = useState("");
  const [filtroEstado, setFiltroEstado] = useState(new Set(["todos"]));
  const [cargando, setCargando] = useState(true);
  const [miembroSeleccionado, setMiembroSeleccionado] = useState(null);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [modoModal, setModoModal] = useState("editar");
  const [page, setPage] = useState(1);
  const [sortDescriptor, setSortDescriptor] = useState({
    column: "estado",
    direction: "ascending",
  });
  const [alert, setAlert] = useState({
    visible: false,
    color: "default",
    title: "",
  });
  const timeoutRef = useRef(null);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalPagesServer, setTotalPagesServer] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  // Estado para mostrar modal de comprobante
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [imageUrl, setImageUrl] = useState(null);

  // ---------- Alertas ----------
  const showAlert = useCallback((color, title) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setAlert({ visible: true, color, title });
    timeoutRef.current = setTimeout(() => {
      setAlert({ visible: false, color: "default", title: "" });
    }, 1000); // Changed to 5000ms (5 seconds)
  }, []);

  // ---------- Utilidades de fecha ----------
  const esFechaISO = (v) =>
    typeof v === "string" && /^\d{4}-\d{2}-\d{2}$/.test(v);

  const parseDateLocal = useCallback((value) => {
    if (!value) return null;
    if (esFechaISO(value)) return new Date(value + "T00:00:00");
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? null : d;
  }, []);

  const formatearFecha = (fecha) => {
    const d = parseDateLocal(fecha);
    if (!d) return "-";
    return d.toLocaleDateString("es-PE", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const addMonthsExact = useCallback((dateInput, months) => {
    const base = parseDateLocal(dateInput);
    const m = parseInt(months, 10);
    if (!base || !m) return null;

    const year = base.getFullYear();
    const month = base.getMonth();
    const day = base.getDate();

    const tmp = new Date(year, month + m, 1);
    const ultimoDiaMesObjetivo = new Date(tmp.getFullYear(), tmp.getMonth() + 1, 0).getDate();
    const result = new Date(tmp.getFullYear(), tmp.getMonth(), Math.min(day, ultimoDiaMesObjetivo));
    result.setHours(0, 0, 0, 0);
    return result;
  }, [parseDateLocal]);

  const obtenerMesesMiembro = useCallback((miembro) => {
    return Number(
      miembro?.mensualidad?.duracion ??
      miembro?.mensualidad?.numero ??
      miembro?.membresia?.duracion ??
      miembro?.membresia?.numero ??
      0
    );
  }, []);

  const calcularVencimientoMiembro = useCallback((miembro) => {
    if (miembro?.vencimiento) return parseDateLocal(miembro.vencimiento);
    const meses = obtenerMesesMiembro(miembro);
    const inicio = miembro?.fechaInicioMembresia ?? miembro?.ultimaRenovacion ?? miembro?.fechaIngreso;
    if (!meses || !inicio) return null;
    return addMonthsExact(inicio, meses);
  }, [parseDateLocal, obtenerMesesMiembro, addMonthsExact]);

  const mostrarVencimiento = (miembro) => {
    const fecha = calcularVencimientoMiembro(miembro);
    return formatearFecha(fecha);
  };

  const calcularEstado = useCallback((miembro) => {
    if (miembro?.estado === "congelado") {
      return { etiqueta: "congelado", color: "secondary" };
    }

    const v = calcularVencimientoMiembro(miembro);
    if (!v) return { etiqueta: "vencido", color: "danger" };
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const diffDias = Math.ceil((v.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDias < 0) return { etiqueta: "vencido", color: "danger" };
    if (diffDias <= 7) return { etiqueta: "a punto de vencer", color: "warning" };
    return { etiqueta: "activo", color: "success" };
  }, [calcularVencimientoMiembro]);

  const formatearMensualidadNumero = (miembro) => {
    const numero = obtenerMesesMiembro(miembro);
    if (!numero) return "-";
    return `${numero} MES${numero > 1 ? "ES" : ""}`;
  };

  // ---------- Descargar Voucher ----------
  const descargarVoucher = async (miembro) => {
    try {
      const response = await api.get(`/pdfvoucher/miembro/${miembro._id}`, {
        responseType: "blob",
        withCredentials: true,
        headers: {
          Accept: "application/pdf",
        },
      });

      const nombreLimpio = miembro.nombreCompleto
        .replace(/\s+/g, "_");

      const blob = response.data;
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `voucher_${nombreLimpio}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("Error al descargar el voucher:", error);
      showAlert("danger", "No se pudo generar el voucher.");
    }
  };

  // --- Mostrar comprobante en modal ---
  const getLatestComprobante = (miembro) => {
    if (!miembro || !Array.isArray(miembro.historialMembresias)) return null;
    // Buscar el último historial que tenga fotocomprobante
    for (let i = miembro.historialMembresias.length - 1; i >= 0; i--) {
      const h = miembro.historialMembresias[i];
      if (h && h.fotocomprobante && h.fotocomprobante.data) {
        return h.fotocomprobante;
      }
    }
    return null;
  };
  
  const openComprobanteModal = (miembro) => {
    const fotocomp = getLatestComprobante(miembro);
    if (!fotocomp || !fotocomp.data) {
      showAlert("warning", "No hay comprobante disponible");
      return;
    }

    try {
      let imageData = null;
      const contentType = fotocomp.contentType || 'image/jpeg';

      // Caso 1: Si data es una string base64 data URL
      if (typeof fotocomp.data === 'string') {
        if (fotocomp.data.startsWith('data:')) {
          setImageUrl(fotocomp.data);
          setIsImageModalOpen(true);
          return;
        }
        // Si es base64 sin el prefijo data:, agregarlo
        if (fotocomp.data.length > 0) {
          imageData = `data:${contentType};base64,${fotocomp.data}`;
          setImageUrl(imageData);
          setIsImageModalOpen(true);
          return;
        }
      }

      // Caso 2: Si data es un objeto Buffer serializado de MongoDB { type: 'Buffer', data: [..] }
      let bufferArray = null;
      if (fotocomp.data && typeof fotocomp.data === 'object') {
        if (fotocomp.data.type === 'Buffer' && Array.isArray(fotocomp.data.data)) {
          bufferArray = fotocomp.data.data;
        } else if (Array.isArray(fotocomp.data)) {
          bufferArray = fotocomp.data;
        } else if (fotocomp.data.data && Array.isArray(fotocomp.data.data)) {
          bufferArray = fotocomp.data.data;
        }
      } else if (Array.isArray(fotocomp.data)) {
        bufferArray = fotocomp.data;
      }

      if (bufferArray && bufferArray.length > 0) {
        // Convertir array a Uint8Array y crear Blob
        const uint8Array = new Uint8Array(bufferArray);
        const blob = new Blob([uint8Array], { type: contentType });
        const url = URL.createObjectURL(blob);
        setImageUrl(url);
        setIsImageModalOpen(true);
        return;
      }

      // Si llegamos aquí, no se pudo procesar
      console.error('Formato de comprobante no reconocido:', fotocomp);
      showAlert("danger", "Formato de comprobante no válido");
    } catch (err) {
      console.error('Error abriendo comprobante:', err, fotocomp);
      showAlert('danger', 'No se pudo abrir el comprobante');
    }
  };

  const closeImageModal = () => {
    if (imageUrl && imageUrl.startsWith('blob:')) {
      URL.revokeObjectURL(imageUrl);
    }
    setImageUrl(null);
    setIsImageModalOpen(false);
  };
  // ---------- Backend ----------
  const obtenerMiembros = useCallback(async (searchTerm, pageParam = 1, estadoFiltro = null) => {
    setCargando(true);
    try {
      // Si hay un filtro de estado activo, obtener TODOS los miembros sin paginación
      const obtenerTodos = estadoFiltro && estadoFiltro !== "todos";
      
      const res = await api.get("/members/miembros", {
        params: { 
          search: searchTerm, 
          page: obtenerTodos ? 1 : pageParam, 
          limit: obtenerTodos ? 10000 : rowsPerPage, // Límite muy alto para obtener todos
          all: obtenerTodos ? "true" : undefined
        },
        withCredentials: true,
      });

      const data = res.data || {};
      const miembrosData = data.miembros || data;

      const miembrosOrdenados = Array.isArray(miembrosData)
        ? miembrosData.slice().sort((a, b) => new Date(b.fechaIngreso) - new Date(a.fechaIngreso))
        : [];

      // Si hay filtro de estado, aplicar el filtro aquí
      let miembrosFiltrados = miembrosOrdenados;
      if (obtenerTodos && estadoFiltro) {
        miembrosFiltrados = miembrosOrdenados.filter((miembro) => {
          const estado = calcularEstado(miembro).etiqueta;
          return estado === estadoFiltro;
        });
      }

      setMiembros(miembrosFiltrados);
      
      if (obtenerTodos) {
        // Cuando hay filtro de estado, mostrar todos sin paginación
        setTotalItems(miembrosFiltrados.length);
        setTotalPagesServer(1);
        setPage(1);
      } else {
        setTotalItems(typeof data.total === 'number' ? data.total : miembrosOrdenados.length);
        setTotalPagesServer(typeof data.totalPages === 'number' ? data.totalPages : Math.max(1, Math.ceil((data.total || miembrosOrdenados.length) / rowsPerPage)));
        setPage(typeof data.page === 'number' ? data.page : pageParam);
      }
    } catch (error) {
      console.error("Error al obtener miembros:", error);
      showAlert("danger", "Error al obtener los miembros.");
    } finally {
      setCargando(false);
    }
  }, [showAlert, rowsPerPage, calcularEstado]);
      useEffect(() => {
        const estadoSeleccionado = Array.from(filtroEstado)[0];
        const obtenerTodos = estadoSeleccionado && estadoSeleccionado !== "todos";

        const delayDebounceFn = setTimeout(() => {
          obtenerMiembros(filtro, obtenerTodos ? 1 : page, estadoSeleccionado);
        }, 400);

        return () => {
          clearTimeout(delayDebounceFn);
        };
      }, [filtro, page, filtroEstado, rowsPerPage, obtenerMiembros]);
      
  const abrirModalActualizar = (miembro, modo = "editar") => {
    setMiembroSeleccionado(miembro);
    setModoModal(modo);
    setMostrarModal(true);
  };

  // ---------- Effects ----------
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      const estadoSeleccionado = Array.from(filtroEstado)[0];
      const obtenerTodos = estadoSeleccionado && estadoSeleccionado !== "todos";
      // Si hay filtro de estado, siempre obtener desde página 1
      obtenerMiembros(filtro, obtenerTodos ? 1 : page, estadoSeleccionado);
    }, 400);
    return () => {
      clearTimeout(delayDebounceFn);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [filtro, page, obtenerMiembros, refresh, filtroEstado]);

  const totalPages = totalPagesServer;

  const miembrosOrdenados = useMemo(() => {
    // Los miembros ya vienen filtrados del backend cuando hay filtro de estado
    let lista = [...miembros];
    
    // Solo aplicar filtro de estado si no se hizo en el backend (para "todos")
    const estadoSeleccionado = Array.from(filtroEstado)[0];
    if (estadoSeleccionado && estadoSeleccionado !== "todos") {
      // Ya está filtrado en el backend, pero por si acaso aplicamos aquí también
      lista = lista.filter((miembro) => {
        const estado = calcularEstado(miembro).etiqueta;
        return estado === estadoSeleccionado;
      });
    }
    
    if (sortDescriptor.column === "estado") {
      lista.sort((a, b) => {
        const estadoA = calcularEstado(a).etiqueta;
        const estadoB = calcularEstado(b).etiqueta;
        const cmp = estadoA.localeCompare(estadoB);
        return sortDescriptor.direction === "descending" ? -cmp : cmp;
      });
    }
    if (sortDescriptor.column === "debe") {
      lista.sort((a, b) => {
        const deudaA = Number(a?.debe || 0);
        const deudaB = Number(b?.debe || 0);
        return sortDescriptor.direction === "descending" ? deudaB - deudaA : deudaA - deudaB;
      });
    }
    if (sortDescriptor.column === "ingreso") {
      lista.sort((a, b) => {
        return sortDescriptor.direction === "descending"
          ? new Date(b.fechaIngreso) - new Date(a.fechaIngreso)
          : new Date(a.fechaIngreso) - new Date(b.fechaIngreso);
      });
    }
    return lista;
  }, [miembros, sortDescriptor, calcularEstado, filtroEstado]);

  return (
    <div className="max-w-full p-3 sm:p-4 md:p-6">
      <div className="flex flex-col gap-3 mb-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:flex-1">
          <Input
            type="text"
            placeholder="Buscar por DNI, CE o nombre completo"
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
            className="w-full sm:max-w-md"
            startContent={<SearchIcon className="text-gray-500" />}
            aria-label="Buscar por DNI, CE o nombre completo"
          />
          
          <Dropdown>
            <DropdownTrigger>
              <Button 
                endContent={<KeyboardArrowDownIcon className="text-small" />} 
                variant="flat"
                className="capitalize"
              >
                {Array.from(filtroEstado)[0] === "todos" ? "Todos los estados" : Array.from(filtroEstado)[0]}
              </Button>
            </DropdownTrigger>
            <DropdownMenu
              disallowEmptySelection
              aria-label="Filtro de Estado"
              closeOnSelect={true}
              selectionMode="single"
              selectedKeys={filtroEstado}
              onSelectionChange={(keys) => { setFiltroEstado(keys); setPage(1); }}
            >
              <DropdownItem key="todos" className="capitalize">
                Todos los estados
              </DropdownItem>
              <DropdownItem key="activo" className="capitalize">
                Activo
              </DropdownItem>
              <DropdownItem key="a punto de vencer" className="capitalize">
                A punto de vencer
              </DropdownItem>
              <DropdownItem key="vencido" className="capitalize">
                Vencido
              </DropdownItem>
              <DropdownItem key="congelado" className="capitalize">
                Congelado
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
          {/* Selector rows per page moved below the table */}
        </div>
        
        <div className="flex items-center gap-3">
          <div className="px-1 text-sm text-gray-600">{totalItems} CLIENTES</div>
        </div>
      </div>
      {cargando ? (
        <div className="flex items-center justify-center h-64">
          <Spinner label="Cargando miembros..." color="primary" />
        </div>
      ) : (
        <div className="w-full">
          <Table
            aria-label="Tabla de miembros"
            removeWrapper
            isStriped
            sortDescriptor={sortDescriptor}
            onSortChange={setSortDescriptor}
            classNames={{
              table: "bg-white w-full table-auto text-[11px]",
              td: "text-gray-800 border-b border-gray-200 align-middle text-[11px] px-1.5 py-0.5",
              th: "bg-gradient-to-r from-gray-900 to-red-900 text-white text-[10px] font-semibold px-1.5 py-1 text-center",
              tr: "hover:bg-gray-50 transition-colors",
            }}
          >
            <TableHeader>
              <TableColumn className="min-w-[140px]">NOMBRE Y APELLIDO</TableColumn>
              <TableColumn className="w-[100px]">TELÉFONO</TableColumn>
              <TableColumn className="hidden md:table-cell">DOCUMENTO</TableColumn>
              <TableColumn key="ingreso" allowsSorting className="min-w-[120px] text-center hidden md:table-cell">INGRESO</TableColumn>
              <TableColumn className="hidden md:table-cell">MENSUALIDAD</TableColumn>
              <TableColumn className="hidden lg:table-cell">ENTRENADOR</TableColumn>
              <TableColumn className="hidden md:table-cell">PAGO</TableColumn>
              <TableColumn key="debe" allowsSorting className="hidden md:table-cell">DEBE</TableColumn>
              <TableColumn>VENCE</TableColumn>
              <TableColumn key="estado" allowsSorting>ESTADO</TableColumn>
              <TableColumn className="hidden md:table-cell">ACCIONES</TableColumn>
            </TableHeader>

            <TableBody emptyContent={"No hay miembros encontrados."}>
              {miembrosOrdenados.map((miembro) => (
                <TableRow key={miembro._id} className="align-middle">
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <AccountCircleRoundedIcon sx={{ color: "#555", fontSize: 18 }} />
                      <span className="text-[11px]">{miembro.nombreCompleto}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-[11px]">{miembro.telefono}</TableCell>
                  <TableCell className="hidden md:table-cell">
                    <div className="flex flex-col gap-0.5">
                      <Chip 
                        color={miembro?.tipoDocumento === "DNI" ? "primary" : "secondary"} 
                        variant="flat"
                        size="sm"
                        className="text-[10px] h-5"
                      >
                        {miembro?.tipoDocumento === "CE" ? "CE" : miembro?.tipoDocumento || "DNI"}
                      </Chip>
                      <span className="text-[9px] text-gray-500">
                        {miembro?.numeroDocumento || "-"}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-[11px]">{formatearFecha(miembro.fechaIngreso)}</TableCell>
                  <TableCell className="hidden md:table-cell">
                    <div className="flex flex-col gap-0.5">
                      <span className="font-medium text-[11px]">{formatearMensualidadNumero(miembro)}</span>
                      <span className="text-[9px] text-gray-500">
                        S/ {Number(miembro?.mensualidad?.precio ?? miembro?.membresia?.precio ?? 0).toFixed(2)}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="hidden lg:table-cell text-[11px]">{miembro?.entrenador?.nombre || "Sin Entrenador"}</TableCell>
                  <TableCell className="hidden capitalize md:table-cell text-[11px]">
                    <div className="flex items-center gap-2">
                      {miembro.metodoPago && metodosPago[miembro.metodoPago.toLowerCase()] ? (
                        <>
                          <img 
                            src={metodosPago[miembro.metodoPago.toLowerCase()].icono} 
                            alt={metodosPago[miembro.metodoPago.toLowerCase()].nombre}
                            className="object-contain w-5 h-5"
                          />
                          {(miembro.metodoPago.toLowerCase() === 'yape' || miembro.metodoPago.toLowerCase() === 'plin') ? (
                            <Button 
                              size="sm" 
                              onClick={() => openComprobanteModal(miembro)} 
                              className={`px-2 py-1 text-[10px] text-white ${metodosPago[miembro.metodoPago.toLowerCase()].color} hover:opacity-90`}
                            >
                              {metodosPago[miembro.metodoPago.toLowerCase()].nombre}
                            </Button>
                          ) : (
                            <span className="capitalize text-[11px]">{metodosPago[miembro.metodoPago.toLowerCase()].nombre}</span>
                          )}
                        </>
                      ) : (
                        <span className="capitalize text-[11px]">{miembro.metodoPago || "-"}</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <div className="flex items-center gap-1">
                      {Number(miembro?.debe || 0) <= 0 ? (
                        <Chip color="success" variant="flat" size="sm" className="text-[10px] h-5">S/ 0.00</Chip>
                      ) : (
                        <Chip color="warning" variant="flat" size="sm" className="text-[10px] h-5">S/ {Number(miembro.debe).toFixed(2)}</Chip>
                      )}
                      <BotonEditarDeuda onClick={() => abrirModalActualizar(miembro, "editarDeuda")} />
                    </div>
                  </TableCell>
                  <TableCell className="text-[11px]">{mostrarVencimiento(miembro)}</TableCell>
                  <TableCell>
                    <Chip color={calcularEstado(miembro).color} variant="flat" size="sm" className="text-[10px] h-5">
                      {calcularEstado(miembro).etiqueta}
                    </Chip>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 h-[35px] justify-end">
                      <AdfScannerRoundedIcon
                        onClick={() => descargarVoucher(miembro)}
                        sx={{ color: "#555555", fontSize: 20, cursor: "pointer" }}
                      />
                      <BotonEditar onClick={() => abrirModalActualizar(miembro)} />
                      <BotonRenovar onClick={() => abrirModalActualizar(miembro, "renovar")} />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center gap-2">
              {Array.from(filtroEstado)[0] === "todos" && (
                <>
                  <label htmlFor="rowsPerPage" className="mr-2 text-sm text-gray-600">Filas por página</label>
                  <select
                    id="rowsPerPage"
                    value={rowsPerPage}
                    onChange={(e) => { setRowsPerPage(Number(e.target.value)); setPage(1); }}
                    className="px-2 py-1 text-sm border rounded"
                    aria-label="Filas por página"
                  >
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={30}>30</option>
                    <option value={40}>40</option>
                    <option value={50}>50</option>
                  </select>
                </>
              )}
              {Array.from(filtroEstado)[0] !== "todos" && !cargando && miembros.length > 0 && (
                <div className="text-sm text-gray-600">
                  Mostrando todos los clientes con estado: <span className="font-semibold">{Array.from(filtroEstado)[0]}</span>
                </div>
              )}
            </div>

            {Array.from(filtroEstado)[0] === "todos" && (
              <div className="flex justify-center flex-1">
                <Pagination
                  total={totalPages}
                  initialPage={page}
                  onChange={(page) => setPage(page)}
                  color="red"
                />
              </div>
            )}
            {Array.from(filtroEstado)[0] !== "todos" && <div className="flex-1" />}
            <div className="w-20" />
          </div>
        </div>
      )}

      {mostrarModal && modoModal !== "editarDeuda" && (
        <ActualizarSuscripcion
          miembro={miembroSeleccionado}
          modo={modoModal}
          onClose={() => setMostrarModal(false)}
          onUpdated={() => {
            obtenerMiembros(filtro, page);
            setMostrarModal(false);
            showAlert("success", modoModal === "editar" ? "Miembro modificado exitosamente" : "Membresía renovada exitosamente");
          }}
        />
      )}

      {mostrarModal && modoModal === "editarDeuda" && (
        <EditarDeuda
          miembro={miembroSeleccionado}
          onClose={() => setMostrarModal(false)}
          onUpdated={() => {
            obtenerMiembros(filtro, page);
            setMostrarModal(false);
            showAlert("success", "Deuda modificada exitosamente");
          }}
        />
      )}

      {alert.visible && (
        <div className="fixed z-50 bottom-5 right-5">
          <Alert color={alert.color} title={alert.title} />
        </div>
      )}

      {/* Modal para mostrar comprobante */}
      <Modal isOpen={isImageModalOpen} onOpenChange={(val) => { if (!val) closeImageModal(); setIsImageModalOpen(val); }} size="lg" backdrop="blur">
        <ModalContent>
          {(onClose) => (
            <div className="text-white rounded-lg bg-neutral-800">
              <ModalHeader>
                <div className="text-lg font-bold text-center">Comprobante</div>
              </ModalHeader>
              <ModalBody className="p-4">
                {imageUrl ? (
                  // si es data URL o blob URL
                  <img src={imageUrl} alt="comprobante" className="w-full h-auto max-h-[70vh] object-contain rounded" />
                ) : (
                  <div className="text-sm text-center text-gray-300">No hay imagen disponible</div>
                )}
              </ModalBody>
              <ModalFooter>
                <Button onClick={() => { closeImageModal(); onClose(); }} className="text-white bg-red-600 hover:bg-red-700">Cerrar</Button>
              </ModalFooter>
            </div>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
}