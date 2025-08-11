import React, { useEffect, useState } from "react";
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
  Pagination
} from "@nextui-org/react";
import AccountCircleOutlinedIcon from "@mui/icons-material/AccountCircleOutlined";
import ActualizarSuscripcion from "../../components/Actualizarmodal/ActualizarSuscripciones";
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditSquareIcon from '@mui/icons-material/EditSquare';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import { IconButton } from "@mui/material";

export default function TablaMiembros() {
  const [miembros, setMiembros] = useState([]);
  const [filtro, setFiltro] = useState("");
  const [cargando, setCargando] = useState(true);
  const [miembroSeleccionado, setMiembroSeleccionado] = useState(null);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [mostrarModalDetalles, setMostrarModalDetalles] = useState(false);

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

  const abrirModalActualizar = (miembro) => {
    setMiembroSeleccionado(miembro);
    setMostrarModal(true);
  };

  const handleVerDetalles = (miembro) => {
    setMiembroSeleccionado(miembro);
    setMostrarModalDetalles(true);
  };

  const formatearRenovacion = (miembro) => {
    if (!miembro.mesesRenovacion || !miembro.fechaInicioRenovacion) return "-";
    try {
      const fechaInicio = new Date(miembro.fechaInicioRenovacion);
      if (isNaN(fechaInicio.getTime())) return "-";

      const fechaFormateada = fechaInicio.toLocaleDateString('es-ES', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });

      return (
        <div className="flex flex-col">
          <span className="font-semibold text-blue-600">
            {miembro.mesesRenovacion} {parseInt(miembro.mesesRenovacion) === 1 ? 'mes' : 'meses'}
          </span>
          <span className="text-sm text-gray-600">
            Desde: {fechaFormateada}
          </span>
        </div>
      );
    } catch (error) {
      return "-";
    }
  };
function verificarEstadoRenovacion(miembro) {
  const parseFecha = (fecha) => {
    if (!fecha) return null;

    // Si la fecha viene como string dd/mm/yyyy
    if (typeof fecha === "string" && fecha.includes("/")) {
      const [dia, mes, año] = fecha.split("/").map(Number);
      return new Date(año, mes - 1, dia);
    }

    // Si ya es Date o formato ISO
    return new Date(fecha);
  };

  // Siempre usar la fecha de ingreso como base
  const fechaBase = parseFecha(miembro.fechaIngreso);
  if (!fechaBase || isNaN(fechaBase)) return "Inactivo";

  // Meses según la membresía seleccionada
  const meses = parseInt(miembro.mesesRenovacion || miembro.membresia?.meses || 1);

  // Calcular fecha de vencimiento
  const fechaVencimiento = new Date(fechaBase);
  fechaVencimiento.setMonth(fechaVencimiento.getMonth() + meses);

  // Comparar con la fecha actual
  return new Date() <= fechaVencimiento ? "Activo" : "Inactivo";
}


  useEffect(() => {
    obtenerMiembros();
  }, []);

  // 🔍 DEBUG: ver qué datos llegan realmente
  useEffect(() => {
    if (miembros.length > 0) {
      console.log("=== DEBUG FECHAS ===");
      miembros.forEach(m => {
        console.log(
          m.nombre,
          "Ingreso:", m.fechaIngreso,
          "Inicio Renovación:", m.fechaInicioRenovacion,
          "Meses:", m.mesesRenovacion
        );
      });
    }
  }, [miembros]);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setMiembros(prevMiembros =>
        prevMiembros.map(miembro => ({
          ...miembro,
          estado: verificarEstadoRenovacion(miembro)
        }))
      );
    }, 60000);
    return () => clearInterval(intervalId);
  }, []);

  const miembrosFiltrados = miembros.filter((miembro) =>
    miembro.nombre.toLowerCase().includes(filtro.toLowerCase())
  );

  return (
    <div className="p-6 bg-white shadow-xl rounded-xl">
      <Input
        type="text"
        placeholder="Buscar por nombre"
        value={filtro}
        onChange={(e) => setFiltro(e.target.value)}
        className="max-w-lg mb-6"
        startContent={<SearchIcon className="text-gray-500" />}
      />

      {cargando ? (
        <div className="flex items-center justify-center h-64">
          <Spinner label="Cargando miembros..." color="primary" />
        </div>
      ) : (
        <Table
          aria-label="Tabla de miembros"
          isStriped
          classNames={{
            base: "border border-red-200",
            table: "bg-white",
            th: "bg-gradient-to-r from-gray-900 to-red-900 text-white font-bold text-sm",
            td: "text-gray-800 border-b border-gray-200 h-[45px] align-middle",
            tr: "hover:bg-gray-50 transition-colors",
          }}
        >
          <TableHeader>
            <TableColumn>ICONO</TableColumn>
            <TableColumn>NOMBRE</TableColumn>
            <TableColumn>CELULAR</TableColumn>
            <TableColumn>INGRESO</TableColumn>
            <TableColumn>RENOVACIÓN</TableColumn>
            <TableColumn>ESTADO</TableColumn>
            <TableColumn>PAGO</TableColumn>
            <TableColumn>MÉTODO</TableColumn>
            <TableColumn>ACCIONES</TableColumn>
          </TableHeader>
          <TableBody emptyContent={"No hay miembros encontrados."}>
            {miembrosFiltrados.map((miembro) => (
              <TableRow key={miembro._id} className="align-middle">
                <TableCell>
                  <div className="p-2 rounded-full bg-slate-300 w-fit">
                    <AccountCircleOutlinedIcon className="text-slate-700" />
                  </div>
                </TableCell>
                <TableCell>{miembro.nombre}</TableCell>
                <TableCell>{miembro.celular}</TableCell>
                <TableCell>{formatearFecha(miembro.fechaIngreso)}</TableCell>
                <TableCell>{formatearRenovacion(miembro)}</TableCell>
                <TableCell>
                  <Chip
                    color={verificarEstadoRenovacion(miembro) === "Activo" ? "success" : "danger"}
                    variant="flat"
                  >
                    {verificarEstadoRenovacion(miembro)}
                  </Chip>
                </TableCell>
                <TableCell>
                  <Chip
                    color={miembro.estadoPago === "Pagado" ? "success" : "warning"}
                    variant="flat"
                  >
                    {miembro.estadoPago}
                  </Chip>
                </TableCell>
                <TableCell>{miembro.metodoPago}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2 h-[45px]">
                    <IconButton 
                      size="small"
                      onClick={() => handleVerDetalles(miembro)}
                      sx={{ color: 'black' }}
                    >
                      <VisibilityIcon />
                    </IconButton>
                    
                    <IconButton 
                      size="small"
                      onClick={() => abrirModalActualizar(miembro)}
                      sx={{ color: 'black' }}
                    >
                      <EditSquareIcon />
                    </IconButton>
                    
                    <IconButton 
                      size="small"
                      onClick={() => eliminarMiembro(miembro._id)}
                      sx={{ color: 'black' }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
      <div className="flex justify-center mt-6">
        <Pagination 
          total={10} 
          initialPage={1}
          classNames={{
            wrapper: "text-gray-800",
            item: "text-gray-800 bg-transparent hover:bg-red-200", 
            cursor: "bg-[#800020]" 
          }}
        />
      </div>

      {mostrarModal && (
        <ActualizarSuscripcion
          miembro={miembroSeleccionado}
          onClose={() => setMostrarModal(false)}
          onUpdated={obtenerMiembros}
        />
      )}
    </div>
  );
}
