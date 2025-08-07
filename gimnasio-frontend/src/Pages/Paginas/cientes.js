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
  Button,
  Spinner,
  Pagination
} from "@nextui-org/react";
import AccountCircleOutlinedIcon from "@mui/icons-material/AccountCircleOutlined";
import ActualizarSuscripcion from "../../components/Actualizarmodal/ActualizarSuscripciones";

export default function TablaMiembros() {
  const [miembros, setMiembros] = useState([]);
  const [filtro, setFiltro] = useState("");
  const [cargando, setCargando] = useState(true);
  const [miembroSeleccionado, setMiembroSeleccionado] = useState(null);
  const [mostrarModal, setMostrarModal] = useState(false);

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

  const formatearFecha = (fecha) => {
    if (!fecha) return "-";
    return new Date(fecha).toLocaleDateString("es-PE");
  };

  const abrirModalActualizar = (miembro) => {
    setMiembroSeleccionado(miembro);
    setMostrarModal(true);
  };

  useEffect(() => {
    obtenerMiembros();
  }, []);

  const miembrosFiltrados = miembros.filter((miembro) =>
    miembro.nombre.toLowerCase().includes(filtro.toLowerCase())
  );

  return (
    <div className="p-6 bg-white shadow-xl rounded-xl">
      <Input
        type="text"
        label="Buscar por nombre"
        value={filtro}
        onChange={(e) => setFiltro(e.target.value)}
        className="max-w-lg mb-6"
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
            table: "bg-white shadow-sm",
            th: "bg-slate-200 text-slate-800 uppercase text-sm",
            td: "text-gray-700",
          }}
        >
          <TableHeader>
            <TableColumn>ICONO</TableColumn>
            <TableColumn>NOMBRE</TableColumn>
            <TableColumn>CELULAR</TableColumn>
            <TableColumn>INGRESO</TableColumn>
            <TableColumn>ÚLT. PAGO</TableColumn>
            <TableColumn>RENOVACIÓN</TableColumn>
            <TableColumn>ESTADO</TableColumn>
            <TableColumn>PAGO</TableColumn>
            <TableColumn>MÉTODO</TableColumn>
            <TableColumn>ACCIONES</TableColumn>
          </TableHeader>
          <TableBody emptyContent={"No hay miembros encontrados."}>
            {miembrosFiltrados.map((miembro) => (
              <TableRow key={miembro._id}>
                <TableCell>
                  <div className="p-2 rounded-full bg-slate-300 w-fit">
                    <AccountCircleOutlinedIcon className="text-slate-700" />
                  </div>
                </TableCell>
                <TableCell>{miembro.nombre}</TableCell>
                <TableCell>{miembro.celular}</TableCell>
                <TableCell>{formatearFecha(miembro.fechaIngreso)}</TableCell>
                <TableCell>{formatearFecha(miembro.ultimoPago)}</TableCell>
                <TableCell>{formatearFecha(miembro.renovacion)}</TableCell>
                <TableCell>
                  <Chip
                    color={miembro.estado === "Activo" ? "success" : "danger"}
                    variant="flat"
                  >
                    {miembro.estado}
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
                <TableCell className="space-x-2">
                  <Button
                    size="sm"
                    color="primary"
                    onClick={() => abrirModalActualizar(miembro)}
                  >
                    Editar
                  </Button>
                  <Button
                    size="sm"
                    color="danger"
                    onClick={() => eliminarMiembro(miembro._id)}
                  >
                    Eliminar
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
      <div className="flex justify-center mt-6">
        <Pagination total={10} initialPage={1} />
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
