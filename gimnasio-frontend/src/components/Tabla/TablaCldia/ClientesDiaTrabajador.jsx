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
  Input,
} from "@heroui/react";
import EditIcon from "@mui/icons-material/Edit";
import AdfScannerRoundedIcon from "@mui/icons-material/AdfScannerRounded";
import IconButton from "@mui/material/IconButton";
import ReporteClientesDia from "../../Pdf/BotonpdfClientesdia";
import api from "../../../utils/axiosInstance";

// 🔹 Formatear hora en 12 horas
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

export default function ClientesDiaTrabajador({ refresh }) {
  const [clientes, setClientes] = useState([]);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [sortDescriptor, setSortDescriptor] = useState({
    column: "nombre",
    direction: "ascending",
  });

  const allowedSortFields = useMemo(
    () => new Set(["nombre", "horaInicio", "metododePago"]),
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

  // Modal editar cliente
  const [modalEditar, setModalEditar] = useState({
    show: false,
    cliente: null,
  });
  const [nombreEdit, setNombreEdit] = useState("");
  const [metodoPagoEdit, setMetodoPagoEdit] = useState("");
  const [guardando, setGuardando] = useState(false);

  const openModalEditar = (cliente) => {
    setNombreEdit(cliente.nombre || "");
    setMetodoPagoEdit(cliente.metododePago || "");
    setModalEditar({ show: true, cliente });
  };

  const closeModalEditar = () => {
    setModalEditar({ show: false, cliente: null });
    setNombreEdit("");
    setMetodoPagoEdit("");
  };

  // 🔹 Guardar cambios
  const handleGuardarEdicion = async () => {
    if (!modalEditar.cliente?._id) return;

    if (nombreEdit.trim() === "" || metodoPagoEdit.trim() === "") {
      showAlert("danger", "Por favor complete todos los campos.");
      return;
    }

    try {
      setGuardando(true);
      await api.put(`/visits/actualizarcliente/${modalEditar.cliente._id}`, {
        nombre: nombreEdit,
        metododePago: metodoPagoEdit,
      });

      showAlert("success", "Cliente actualizado correctamente");
      closeModalEditar();
      await fetchClientes();
    } catch (error) {
      console.error("Error al actualizar cliente:", error);
      showAlert("danger", "Error al guardar los cambios");
    } finally {
      setGuardando(false);
    }
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

  const loadingState = isLoading ? "loading" : "idle";

  if (!Array.isArray(clientes)) return null;

  return (
    <div className="p-4 bg-gray-100 rounded-xl">
      <h2 className="mb-4 text-xl font-bold text-black">Clientes de Hoy</h2>

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
        aria-label="Tabla de clientes de hoy"
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
          base: "bg-white rounded-lg shadow",
          th: "text-red-600 font-bold bg-gray-200",
          td: "text-black",
        }}
      >
        <TableHeader>
          <TableColumn key="nombre" allowsSorting>Nombre</TableColumn>
          <TableColumn key="fecha" allowsSorting>Fecha</TableColumn>
          <TableColumn key="horaInicio" allowsSorting>Hora de Inicio</TableColumn>
          <TableColumn key="metododePago" allowsSorting>Método de Pago</TableColumn>
          <TableColumn key="precio" className="text-right" allowsSorting>Monto (S/)</TableColumn>
          <TableColumn key="acciones" className="text-center">Acciones</TableColumn>
        </TableHeader>

        <TableBody
          items={sortedItems}
          loadingState={loadingState}
          loadingContent={
            <div className="flex items-center justify-center h-40">
              <CircularProgress aria-label="Cargando..." size="lg" color="default" />
            </div>
          }
          emptyContent={"Inscriba los Clientes de hoy"}
        >
          {(cliente) => (
            <TableRow key={cliente._id || cliente.nombre}>
              <TableCell>{cliente.nombre || "Sin nombre"}</TableCell>
              <TableCell>
                {cliente.fecha ? new Date(cliente.fecha).toLocaleDateString() : "Sin fecha"}
              </TableCell>
              <TableCell>{formatTime12Hour(cliente.horaInicio)}</TableCell>
              <TableCell>{cliente.metododePago || "No definido"}</TableCell>
              <TableCell className="text-right">{cliente.monto ?? 7}</TableCell>

              {/* 🔹 Acciones (sin eliminar) */}
              <TableCell className="text-center">
                <div className="flex justify-center items-center gap-3">
                  <IconButton
                    aria-label="Descargar voucher"
                    onClick={() => descargarVoucher(cliente)}
                    sx={{ color: "#d32f2f", "&:hover": { color: "#9a1b1b" }, p: 0.7 }}
                  >
                    <AdfScannerRoundedIcon sx={{ fontSize: 26 }} />
                  </IconButton>

                  <IconButton
                    aria-label="Editar cliente"
                    onClick={() => openModalEditar(cliente)}
                    sx={{ color: "#d32f2f", "&:hover": { color: "#9a1b1b" }, p: 0.7 }}
                  >
                    <EditIcon sx={{ fontSize: 26 }} />
                  </IconButton>
                </div>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      <div className="flex items-center justify-between mt-4">
        <div className="text-lg font-bold text-black">
          Total Recaudado Hoy: <span className="text-red-600">S/ {totalMontoHoy.toFixed(2)}</span>
        </div>
        <ReporteClientesDia />
      </div>

      {/* Modal editar cliente */}
      <Modal isOpen={modalEditar.show} onClose={closeModalEditar} size="md" placement="center">
        <ModalContent className="bg-[#101820] text-white rounded-2xl">
          <ModalHeader className="text-lg font-bold">Editar Cliente</ModalHeader>
          <ModalBody className="space-y-3">
            <div>
              <label className="block text-sm text-gray-300 mb-1">Nombre y Apellido</label>
              <Input
                variant="flat"
                radius="md"
                value={nombreEdit}
                onChange={(e) => setNombreEdit(e.target.value)}
                classNames={{
                  input: "bg-[#1a1f2b] text-white",
                  inputWrapper: "bg-[#1a1f2b] border border-gray-700",
                }}
                placeholder="Ingrese el nombre"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-300 mb-2">Método de Pago</label>
              <div className="flex gap-3">
                {["Yape", "Plin", "Efectivo"].map((m) => (
                  <Button
                    key={m}
                    onPress={() => setMetodoPagoEdit(m)}
                    className={`text-white font-semibold ${
                      metodoPagoEdit === m
                        ? "bg-red-600 hover:bg-red-700"
                        : "bg-[#1a1f2b] hover:bg-[#2a2f3b]"
                    }`}
                    radius="md"
                    size="sm"
                  >
                    {m}
                  </Button>
                ))}
              </div>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button color="default" variant="flat" onPress={closeModalEditar}>
              Cancelar
            </Button>
            <Button
              color="danger"
              onPress={handleGuardarEdicion}
              isDisabled={guardando}
              className="bg-red-700 text-white hover:bg-red-800"
            >
              {guardando ? "Guardando..." : "Guardar Cambios"}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}
