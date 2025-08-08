import React, { useEffect, useState, useMemo } from "react";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Pagination,
  Spinner,
} from "@heroui/react";
import axios from "axios";
import DeleteIcon from '@mui/icons-material/Delete';
import IconButton from '@mui/material/IconButton';

export default function TablaClientesHoy({ refresh }) {
  const [clientes, setClientes] = useState([]);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  const rowsPerPage = 5;

  const fetchClientes = async () => {
    try {
      setIsLoading(true);
      const res = await axios.get("http://localhost:4000/visits/clientesdia", {
        withCredentials: true,
      });
      setClientes(res.data);
    } catch (err) {
      console.error("Error al obtener clientes:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchClientes();
  }, []);

  useEffect(() => {
    fetchClientes();
  }, [refresh]);

  // === Filtrar clientes de hoy ===
  const hoy = new Date();
  const inicioHoy = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());

  const clientesHoy = clientes.filter((c) => {
    const fecha = new Date(c.fecha);
    return fecha.setHours(0, 0, 0, 0) === inicioHoy.setHours(0, 0, 0, 0);
  });

  // === Total de hoy ===
  const totalHoy = clientesHoy.reduce((acc, c) => acc + (c.precio || 7), 0);

  // === Paginación ===
  const pages = useMemo(() => {
    return clientesHoy.length ? Math.ceil(clientesHoy.length / rowsPerPage) : 0;
  }, [clientesHoy.length]);

  const items = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    return clientesHoy.slice(start, end);
  }, [page, clientesHoy]);

  const loadingState =
    isLoading || clientesHoy.length === 0 ? "loading" : "idle";

  // === Función para eliminar cliente ===
  const handleDelete = async (id) => {
    if (!id) return;
    const confirm = window.confirm("¿Estás seguro de eliminar este cliente?");
    if (!confirm) return;

    try {
      await axios.delete(`http://localhost:4000/visits/eliminarcliente/${id}`, {
        withCredentials: true,
      });
      fetchClientes(); // Refrescar la tabla
      alert("Cliente eliminado exitosamente");
    } catch (err) {
      console.error("Error al eliminar cliente:", err);
      alert("Error al eliminar el cliente");
    }
  };

  if (!Array.isArray(clientes)) return null;

  return (
    <div className="p-4 bg-gray-100 rounded-xl">
      <h2 className="mb-4 text-xl font-bold text-black">Clientes de Hoy</h2>

      <Table
        aria-label="Tabla de clientes de hoy"
        bottomContent={
          pages > 1 ? (
            <div className="flex justify-center w-full mt-3">
              <Pagination
                isCompact
                showControls
                color="primary"
                page={page}
                total={pages}
                onChange={(page) => setPage(page)}
              />
            </div>
          ) : null
        }
        classNames={{
          base: "bg-white rounded-lg shadow",
          th: "text-red-600 font-bold bg-gray-200",
          td: "text-black",
        }}
      >
        <TableHeader>
          <TableColumn>Nombre</TableColumn>
          <TableColumn>Fecha</TableColumn>
          <TableColumn>Hora de Inicio</TableColumn>
          <TableColumn>Método de Pago</TableColumn>
          <TableColumn className="text-right">Monto (S/)</TableColumn>
          <TableColumn className="text-center">Eliminar</TableColumn>
        </TableHeader>

        <TableBody
          items={items}
          loadingState={loadingState}
          loadingContent={<Spinner label="Cargando clientes..." />}
          emptyContent={"No hay clientes registrados hoy"}
        >
          {(cliente) => {
            try {
              return (
                <TableRow key={cliente._id || cliente.nombre}>
                  <TableCell>{cliente.nombre || "Sin nombre"}</TableCell>
                  <TableCell>
                    {cliente.fecha
                      ? new Date(cliente.fecha).toLocaleDateString()
                      : "Sin fecha"}
                  </TableCell>
                  <TableCell>{cliente.horaInicio || "Sin hora"}</TableCell>
                  <TableCell>{cliente.metododePago || "No definido"}</TableCell>
                  <TableCell className="text-right">
                    {cliente.precio || 7}
                  </TableCell>
                  <TableCell className="text-center">
                    <IconButton
                      aria-label="Eliminar cliente"
                      color="error"
                      onClick={() => handleDelete(cliente._id)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              );
            } catch (error) {
              console.error("Error al renderizar cliente:", error);
              return null;
            }
          }}
        </TableBody>
      </Table>

      {/* Total de Hoy */}
      <div className="flex justify-end mt-4 text-lg font-bold text-black">
        <span className="mr-2">Total de Hoy:</span>
        <span className="text-red-600">S/ {totalHoy}</span>
      </div>
    </div>
  );
}
