import React, { useEffect, useMemo, useState } from "react";
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
} from "@nextui-org/react";
import ActualizarSuscripcion from "../../components/Actualizarmodal/ActualizarSuscripciones";
import EditSquareIcon from '@mui/icons-material/EditSquare';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import AutorenewIcon from '@mui/icons-material/Autorenew';
import { IconButton } from "@mui/material";

export default function TablaMiembros() {
  const [miembros, setMiembros] = useState([]);
  const [filtro, setFiltro] = useState("");
  const [cargando, setCargando] = useState(true);
  const [miembroSeleccionado, setMiembroSeleccionado] = useState(null);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [modoModal, setModoModal] = useState('editar');
  const [page, setPage] = useState(1);
  const rowsPerPage = 10;
  // const [mostrarModalDetalles, setMostrarModalDetalles] = useState(false);

  const obtenerMiembros = async () => {
    try {
      const res = await axios.get("http://localhost:4000/members/miembros", { withCredentials: true });
      setMiembros(res.data);
      setCargando(false);
    } catch (error) {
      console.error("Error al obtener miembros:", error);
      setCargando(false);
    }
  };

  const eliminarMiembro = async (id) => {
    try {
      await axios.delete(`http://localhost:4000/members/eliminarmiembro/${id}`, { withCredentials: true });
      obtenerMiembros();
    } catch (error) {
      console.error("Error al eliminar miembro:", error);
    }
  };

  function formatearFecha(fecha) {
    if (!fecha) return "";
    const fechaObj = new Date(fecha);
    const dia = String(fechaObj.getDate()).padStart(2, "0");
    const mes = String(fechaObj.getMonth() + 1).padStart(2, "0");
    const anio = fechaObj.getFullYear();
    return `${dia}/${mes}/${anio}`;
  }

  const calcularEstado = (vencimiento) => {
    if (!vencimiento) return { etiqueta: 'vencido', color: 'danger' };
    const hoy = new Date();
    const v = new Date(vencimiento);
    const diff = Math.ceil((v.getTime() - hoy.getTime()) / (1000*60*60*24));
    if (diff < 0) return { etiqueta: 'vencido', color: 'danger' };
    if (diff <= 7) return { etiqueta: 'a punto de vencer', color: 'warning' };
    return { etiqueta: 'activo', color: 'success' };
  };

  const formatearMensualidadNumero = (miembro) => {
    const numero = miembro?.mensualidad?.duracion || miembro?.mensualidad?.numero || miembro?.membresia?.duracion || miembro?.membresia?.numero;
    if (!numero) return '-';
    return `${numero} MES`;
  };

  const tituloMensualidadVence = (miembro) => {
    const numero = miembro?.mensualidad?.duracion || miembro?.mensualidad?.numero || miembro?.membresia?.duracion || miembro?.membresia?.numero;
    const ven = miembro?.vencimiento;
    if (!numero || !ven) return '-';
    return `${numero} MES — vence ${formatearFecha(ven)}`;
  };

  const abrirModalActualizar = (miembro, modo = 'editar') => {
    setMiembroSeleccionado(miembro);
    setModoModal(modo);
    setMostrarModal(true);
  };
  useEffect(() => {
    obtenerMiembros();
  }, []);


  const miembrosFiltrados = useMemo(() =>
    miembros.filter((miembro) => (miembro.nombreCompleto || '').toLowerCase().includes(filtro.toLowerCase()))
  , [miembros, filtro]);

  const totalPages = useMemo(() => Math.max(1, Math.ceil(miembrosFiltrados.length / rowsPerPage)), [miembrosFiltrados.length]);
  const paginaSegura = Math.min(page, totalPages);
  const itemsVisibles = useMemo(() => {
    const start = (paginaSegura - 1) * rowsPerPage;
    return miembrosFiltrados.slice(start, start + rowsPerPage);
  }, [miembrosFiltrados, paginaSegura]);

  useEffect(() => {
   
    setPage(1);
  }, [filtro, miembrosFiltrados.length]);

  return (
    <div className="p-3 sm:p-4 md:p-6 bg-white shadow-xl rounded-xl max-w-full md:max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <Input
          type="text"
          placeholder="Buscar por nombre"
          value={filtro}
          onChange={(e) => setFiltro(e.target.value)}
          className="w-full sm:max-w-md"
          startContent={<SearchIcon className="text-gray-500" />}
        />
        <div className="text-sm text-gray-600 px-1">{miembrosFiltrados.length} resultados</div>
      </div>

      {cargando ? (
        <div className="flex items-center justify-center h-64">
          <Spinner label="Cargando miembros..." color="primary" />
        </div>
      ) : (
        <div className="max-h-[60vh] overflow-auto rounded-lg border overflow-x-auto">
        <Table
          aria-label="Tabla de miembros"
          removeWrapper
          isStriped
          classNames={{
            base: "",
            table: "bg-white min-w-full",
            th: "bg-gradient-to-r from-gray-900 to-red-900 text-white text-[11px] sm:text-xs md:text-sm font-semibold",
            td: "text-gray-800 border-b border-gray-200 align-middle text-[11px] sm:text-xs md:text-sm",
            tr: "hover:bg-gray-50 transition-colors",
          }}
        >
          <TableHeader>
            <TableColumn className="min-w-[10rem] sm:min-w-[12rem] md:w-[16rem]">NOMBRE Y APELLIDO</TableColumn>
            <TableColumn className="w-[7rem] sm:w-[8rem]">TELÉFONO</TableColumn>
            <TableColumn className="hidden md:table-cell w-[8rem]">INGRESO</TableColumn>
            <TableColumn className="hidden md:table-cell w-[7rem]">MENSUAL.</TableColumn>
            <TableColumn className="hidden lg:table-cell w-[10rem]">ENTRENADOR</TableColumn>
            <TableColumn className="hidden md:table-cell w-[9rem]">PAGO</TableColumn>
            <TableColumn className="min-w-[10rem] sm:w-[12rem]">MENSUALIDAD / VENCE</TableColumn>
            <TableColumn className="w-[7rem]">ESTADO</TableColumn>
            <TableColumn className="w-[12rem] text-right">ACCIONES</TableColumn>
          </TableHeader>
          <TableBody emptyContent={"No hay miembros encontrados."}>
            {itemsVisibles.map((miembro) => (
              <TableRow key={miembro._id} className="align-middle">
                <TableCell className="whitespace-nowrap text-ellipsis overflow-hidden">{miembro.nombreCompleto}</TableCell>
                <TableCell className="whitespace-nowrap">{miembro.telefono}</TableCell>
                <TableCell className="hidden md:table-cell whitespace-nowrap">{formatearFecha(miembro.fechaIngreso)}</TableCell>
                <TableCell className="hidden md:table-cell whitespace-nowrap">{formatearMensualidadNumero(miembro)}</TableCell>
                <TableCell className="hidden lg:table-cell whitespace-nowrap">{miembro?.entrenador?.nombre || '-'}</TableCell>
                <TableCell className="hidden md:table-cell capitalize whitespace-nowrap">{miembro.metodoPago}</TableCell>
                <TableCell className="truncate" title={tituloMensualidadVence(miembro)}>{tituloMensualidadVence(miembro)}</TableCell>
                <TableCell>
                  {(() => {
                    const est = calcularEstado(miembro.vencimiento);
                    return (
                      <Chip color={est.color} variant="flat">
                        {est.etiqueta}
                      </Chip>
                    );
                  })()}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1 sm:gap-2 h-[45px] justify-end">
                    <IconButton size="small" onClick={() => abrirModalActualizar(miembro)} sx={{ color: '#555' }} title="Editar">
                      <EditSquareIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small" onClick={() => abrirModalActualizar(miembro, 'renovar')} sx={{ color: '#555' }} title="Renovar">
                      <AutorenewIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small" onClick={() => eliminarMiembro(miembro._id)} sx={{ color: '#555' }} title="Eliminar">
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        </div>
      )}


      {mostrarModal && (
        <ActualizarSuscripcion
          miembro={miembroSeleccionado}
          modo={modoModal}
          onClose={() => setMostrarModal(false)}
          onUpdated={obtenerMiembros}
        />
      )}
    </div>
  );
}
