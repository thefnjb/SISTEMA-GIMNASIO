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
  Button
} from "@heroui/react";
import axios from "axios";
import DeleteIcon from '@mui/icons-material/Delete';
import IconButton from '@mui/material/IconButton';
import ModalResumenPagos from "../../Modal/ModalResumenPagos";

/**
  @param {string} timeString 
  @returns {string} 
 */

const formatTime12Hour = (timeString) => {
  if (!timeString || typeof timeString !== 'string') {
    return "Sin hora";
  }

  const date = new Date(`1970-01-01T${timeString}`);
  if (isNaN(date.getTime())) {
    return timeString; 
  }
  return date.toLocaleTimeString('es-PE', { hour: 'numeric', minute: '2-digit', hour12: true });
};

export default function TablaClientesHoy({ refresh }) {
  const [clientes, setClientes] = useState([]);
  const [resumenPagos, setResumenPagos] = useState({ Yape: 0, Plin: 0, Efectivo: 0, Total: 0 });
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [sortDescriptor, setSortDescriptor] = useState({
    column: "nombre",
    direction: "ascending",
  });
  const [isModalOpen, setIsModalOpen] = useState(false); 

  const rowsPerPage = 4;

  const fetchClientes = async () => {
    try {
      setIsLoading(true);
      const res = await axios.get("http://localhost:4000/visits/clientesdia", {
        withCredentials: true,
      });
      setClientes(res.data.clientes);
      setResumenPagos(res.data.resumenPagos);
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

  // === Paginación ===
  const pages = useMemo(() => {
    return clientes.length ? Math.ceil(clientes.length / rowsPerPage) : 0;
  }, [clientes.length]);

  const items = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    return clientes.slice(start, end);
  }, [page, clientes]);

  const sortedItems = useMemo(() => {
    return [...items].sort((a, b) => {
      const first = a[sortDescriptor.column];
      const second = b[sortDescriptor.column];
      const cmp = first < second ? -1 : first > second ? 1 : 0;

      return sortDescriptor.direction === "descending" ? -cmp : cmp;
    });
  }, [sortDescriptor, items]);


  const loadingState =
    isLoading || clientes.length === 0 ? "loading" : "idle";

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

  // Calcular el total de montos pagados
  const totalMontoHoy = useMemo(() => {
    return clientes.reduce((acc, cliente) => acc + (cliente.precio || 7), 0);
  }, [clientes]);

  if (!Array.isArray(clientes)) return null;

  return (
    <div className="p-4 bg-gray-100 rounded-xl">
      <h2 className="mb-4 text-xl font-bold text-black">Clientes de Hoy</h2>

      <Table
        aria-label="Tabla de clientes de hoy"
        sortDescriptor={sortDescriptor}
        onSortChange={setSortDescriptor}
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
          <TableColumn key="nombre" allowsSorting>
            Nombre
          </TableColumn>
          <TableColumn key="fecha" allowsSorting>
            Fecha
          </TableColumn>
          <TableColumn key="horaInicio" allowsSorting>
            Hora de Inicio
          </TableColumn>
          <TableColumn key="metododePago" allowsSorting>
            Método de Pago
          </TableColumn>
          <TableColumn key="precio" className="text-right" allowsSorting>
            Monto (S/)
          </TableColumn>
          <TableColumn key="eliminar" className="text-center">Eliminar</TableColumn>
        </TableHeader>

        <TableBody
          items={sortedItems}
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
                  <TableCell>{formatTime12Hour(cliente.horaInicio)}</TableCell>
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

      {/* Información de Resumen y Botón */}
      <div className="flex items-center justify-end gap-4 mt-4">
        <div className="text-lg font-bold text-black">
          Total Recaudado Hoy: <span className="text-red-600">S/ {totalMontoHoy.toFixed(2)}</span>
        </div>
        <Button className="text-white" style={{ backgroundColor: "#7a0f16" }} variant="solid" onClick={() => setIsModalOpen(true)}>
          Detalles de Pagos
        </Button>
      </div>
      {/* Modal de Resumen de Pagos */}
      <ModalResumenPagos
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        clientes={clientes}
        resumenPagos={resumenPagos}
      />
    </div>
  );
}