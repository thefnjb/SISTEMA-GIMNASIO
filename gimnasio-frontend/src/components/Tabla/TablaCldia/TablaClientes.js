import React, { useEffect, useMemo, useState, useCallback, useRef } from "react";
import axios from "axios";
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
  Button,
} from "@nextui-org/react";
import { Alert } from "@heroui/react";
import ActualizarSuscripcion from "../../Actualizarmodal/ActualizarSuscripciones";
import SearchIcon from "@mui/icons-material/Search";
import AccountCircleRoundedIcon from "@mui/icons-material/AccountCircleRounded";
import BotonEditar from "../../Iconos/BotonEditar";
import BotonEliminar from "../../Iconos/BotonEliminar";
import BotonRenovar from "../../Iconos/BotonRenovar";
import BotonEditarDeuda from "../../Iconos/BotonEditarDeuda";
import EditarDeuda from "../../Modal/ActualizarModal/EditarDeuda";

export default function TablaMiembros({ refresh }) {
  const [miembros, setMiembros] = useState([]);
  const [filtro, setFiltro] = useState("");
  const [cargando, setCargando] = useState(true);
  const [miembroSeleccionado, setMiembroSeleccionado] = useState(null);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [modoModal, setModoModal] = useState("editar");
  const [page, setPage] = useState(1);
  const [alert, setAlert] = useState({
    visible: false,
    color: "default",
    title: "",
  });
  const timeoutRef = useRef(null);
  const rowsPerPage = 10;

  // ---------- Alertas ----------
  const showAlert = useCallback((color, title) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setAlert({ visible: true, color, title });
    timeoutRef.current = setTimeout(() => {
      setAlert({ visible: false, color: "default", title: "" });
    }, 4000);
  }, []);

  // ---------- Utilidades de fecha ----------
  const esFechaISO = (v) => typeof v === "string" && /^\d{4}-\d{2}-\d{2}$/.test(v);

  const parseDateLocal = (value) => {
    if (!value) return null;
    if (esFechaISO(value)) return new Date(value + "T00:00:00");
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? null : d;
  };

  const formatearFecha = (fecha) => {
    const d = parseDateLocal(fecha);
    if (!d) return "-";
    return d.toLocaleDateString("es-PE", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const addMonthsExact = (dateInput, months) => {
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
  };

  const obtenerMesesMiembro = (miembro) => {
    return Number(miembro?.mensualidad?.duracion ?? miembro?.mensualidad?.numero ??
      miembro?.membresia?.duracion ?? miembro?.membresia?.numero ?? 0);
  };

  const calcularVencimientoMiembro = (miembro) => {
    if (miembro?.vencimiento) return parseDateLocal(miembro.vencimiento);

    const meses = obtenerMesesMiembro(miembro);
    const inicio = miembro?.fechaInicioMembresia ?? miembro?.ultimaRenovacion ?? miembro?.fechaIngreso;
    if (!meses || !inicio) return null;
    return addMonthsExact(inicio, meses);
  };

  const mostrarVencimiento = (miembro) => {
    const fecha = calcularVencimientoMiembro(miembro);
    return formatearFecha(fecha);
  };

  const calcularEstado = (miembro) => {
    const v = calcularVencimientoMiembro(miembro);
    if (!v) return { etiqueta: "vencido", color: "danger" };
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const diffDias = Math.ceil((v.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDias < 0) return { etiqueta: "vencido", color: "danger" };
    if (diffDias <= 7) return { etiqueta: "a punto de vencer", color: "warning" };
    return { etiqueta: "activo", color: "success" };
  };

  const formatearMensualidadNumero = (miembro) => {
    const numero = obtenerMesesMiembro(miembro);
    if (!numero) return "-";
    return `${numero} MES${numero > 1 ? "ES" : ""}`;
  };

  // ---------- Backend ----------
  const obtenerMiembros = useCallback(async (searchTerm) => {
    setCargando(true);
    try {
      const res = await axios.get("http://localhost:4000/members/miembros", {
        params: { search: searchTerm },
        withCredentials: true,
      });
      
      // Ordenar por fechaIngreso descendente (más reciente primero)
      const miembrosOrdenados = (res.data.miembros || res.data).slice().sort((a, b) => {
        const fechaA = new Date(a.fechaIngreso);
        const fechaB = new Date(b.fechaIngreso);
        return fechaB - fechaA; // Orden descendente (más reciente primero)
      });
      
      setMiembros(miembrosOrdenados);
      setCargando(false);
    } catch (error) {
      console.error("Error al obtener miembros:", error);
      setCargando(false);
      showAlert("danger", "Error al obtener los miembros.");
    }
  }, [showAlert]);

  // Función de eliminación directa sin confirmación
  const eliminarMiembro = useCallback(async (memberId) => {
    if (!memberId) return;
    
    try {
      await axios.delete(`http://localhost:4000/members/miembros/${memberId}`, {
        withCredentials: true,
      });
      obtenerMiembros(filtro); // Re-fetch con filtro actual
      showAlert("success", "Miembro eliminado exitosamente.");
    } catch (error) {
      console.error("Error al eliminar miembro:", error.response?.data || error.message);
      showAlert("danger", "Error al eliminar el miembro.");
    }
  }, [obtenerMiembros, filtro, showAlert]);

  const abrirModalActualizar = (miembro, modo = "editar") => {
    setMiembroSeleccionado(miembro);
    setModoModal(modo);
    setMostrarModal(true);
  };

  // ---------- Effects ----------
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      obtenerMiembros(filtro);
    }, 400); 

    return () => {
      clearTimeout(delayDebounceFn);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [filtro, obtenerMiembros, refresh]);

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(miembros.length / rowsPerPage)),
    [miembros.length]
  );
  const paginaSegura = Math.min(page, totalPages);
  const itemsVisibles = useMemo(() => {
    const start = (paginaSegura - 1) * rowsPerPage;
    return miembros.slice(start, start + rowsPerPage);
  }, [miembros, paginaSegura]);

  useEffect(() => {
    setPage(1);
  }, [filtro, miembros.length]);

  return (
    <div className="max-w-full p-3 sm:p-4 md:p-6">
      <div className="flex flex-col gap-3 mb-4 sm:flex-row sm:items-center sm:justify-between">
        <Input
          type="text"
          placeholder="Buscar por nombre o teléfono"
          value={filtro}
          onChange={(e) => setFiltro(e.target.value)}
          className="w-full sm:max-w-md"
          startContent={<SearchIcon className="text-gray-500" />}
        />
        <div className="px-1 text-sm text-gray-600">{miembros.length} resultados</div>
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
            classNames={{
              table: "bg-white min-w-full",
              th: "bg-gradient-to-r from-gray-900 to-red-900 text-white text-[11px] sm:text-xs md:text-sm font-semibold whitespace-normal break-words text-center px-3 py-2",
              td: "text-gray-800 border-b border-gray-200 align-middle text-[11px] sm:text-xs md:text-sm px-3 py-2",
              tr: "hover:bg-gray-50 transition-colors",
            }}
          >
            <TableHeader>
              <TableColumn>NOMBRE Y APELLIDO</TableColumn>
              <TableColumn>TELÉFONO</TableColumn>
              <TableColumn className="hidden md:table-cell">INGRESO</TableColumn>
              <TableColumn className="hidden md:table-cell">MENSUALIDAD</TableColumn>
              <TableColumn className="hidden lg:table-cell">ENTRENADOR</TableColumn>
              <TableColumn className="hidden md:table-cell">PAGO</TableColumn>
              <TableColumn className="hidden md:table-cell">DEBE</TableColumn>
              <TableColumn>VENCE</TableColumn>
              <TableColumn>ESTADO</TableColumn>
              <TableColumn className="text-right">ACCIONES</TableColumn>
            </TableHeader>

            <TableBody emptyContent={"No hay miembros encontrados."}>
              {itemsVisibles.map((miembro) => (
                <TableRow key={miembro._id} className="align-middle">
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <AccountCircleRoundedIcon sx={{ color: "#555", fontSize: 28 }} />
                      <span>{miembro.nombreCompleto}</span>
                    </div>
                  </TableCell>

                  <TableCell>{miembro.telefono}</TableCell>

                  <TableCell className="hidden md:table-cell">
                    {formatearFecha(miembro.fechaIngreso)}
                  </TableCell>

                  <TableCell className="hidden md:table-cell">
                    <div className="flex flex-col">
                      <span className="font-medium">{formatearMensualidadNumero(miembro)}</span>
                      <span className="text-xs text-gray-500">
                        Turno: S/{" "}
                        {Number(miembro?.mensualidad?.precio ??
                          miembro?.membresia?.precio ??
                          0).toFixed(2)}
                      </span>
                    </div>
                  </TableCell>

                  <TableCell className="hidden lg:table-cell">
                    {miembro?.entrenador?.nombre || "-"}
                  </TableCell>

                  <TableCell className="hidden capitalize md:table-cell">
                    {miembro.metodoPago}
                  </TableCell>

                  <TableCell className="hidden md:table-cell">
                    <div className="flex items-center gap-2">
                      {(() => {
                        const deuda = Number(miembro?.debe || 0);
                        if (deuda <= 0) {
                          return (
                            <Chip color="success" variant="flat">
                              S/ 0.00
                            </Chip>
                          );
                        }
                        return (
                          <Chip color="warning" variant="flat">
                            S/ {deuda.toFixed(2)}
                          </Chip>
                        );
                      })()}
                      <BotonEditarDeuda
                        onClick={() => abrirModalActualizar(miembro, "editarDeuda")}
                      />
                    </div>
                  </TableCell>

                  <TableCell>{mostrarVencimiento(miembro)}</TableCell>

                  <TableCell>
                    {(() => {
                      const est = calcularEstado(miembro);
                      return (
                        <Chip color={est.color} variant="flat">
                          {est.etiqueta}
                        </Chip>
                      );
                    })()}
                  </TableCell>

                  <TableCell>
                    <div className="flex items-center gap-1 sm:gap-2 h-[45px] justify-end">
                      <BotonEditar
                        onClick={() => abrirModalActualizar(miembro)}
                      />
                      <BotonRenovar
                        onClick={() => abrirModalActualizar(miembro, "renovar")}
                      />
                      <BotonEliminar
                        onClick={() => eliminarMiembro(miembro._id)}
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* Paginación */}
          <div className="flex items-center justify-between mt-4">
            <Button
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Anterior
            </Button>
            <span className="text-sm text-gray-600">
              Página {paginaSegura} de {totalPages}
            </span>
            <Button
              size="sm"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            >
              Siguiente
            </Button>
          </div>
        </div>
      )}

      {mostrarModal && modoModal !== "editarDeuda" && (
        <ActualizarSuscripcion
          miembro={miembroSeleccionado}
          modo={modoModal}
          onClose={() => setMostrarModal(false)}
          onUpdated={() => {
            obtenerMiembros(filtro);
            setMostrarModal(false);
            showAlert(
              "success",
              modoModal === "editar"
                ? "Miembro modificado exitosamente"
                : "Membresía renovada exitosamente"
            );
          }}
        />
      )}

      {mostrarModal && modoModal === "editarDeuda" && (
        <EditarDeuda
          miembro={miembroSeleccionado}
          onClose={() => setMostrarModal(false)}
          onUpdated={() => {
            obtenerMiembros(filtro);
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
    </div>
  );
}