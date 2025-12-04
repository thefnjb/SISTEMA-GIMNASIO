import React, { useEffect, useState, useCallback, useRef } from "react";
import api from "../../utils/axiosInstance";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Button,
  Input,
  Chip,
  Spinner,
  Tooltip,
} from "@nextui-org/react";
import { Alert } from "@heroui/react";
import SearchIcon from "@mui/icons-material/Search";
import CoPresentRoundedIcon from '@mui/icons-material/CoPresentRounded';
import BotonEditar from "../Iconos/BotonEditar";
import BotonEliminar from "../Iconos/BotonEliminar";
import CancelPresentationRoundedIcon from "@mui/icons-material/CancelPresentationRounded";
import PlayCircleOutlineRoundedIcon from "@mui/icons-material/PlayCircleOutlineRounded";
import ModalEditarTrabajador from "./ModalEditarTrabajador";

export default function TablaTrabajadores({ refresh }) {
  const [trabajadores, setTrabajadores] = useState([]);
  const [filtro, setFiltro] = useState("");
  const [cargando, setCargando] = useState(true);
  const [editingTrabajador, setEditingTrabajador] = useState(null);
  const [alert, setAlert] = useState({ visible: false, color: "default", title: "" });
  const timeoutRef = useRef(null);

  // --- Alertas ---
  const showAlert = useCallback((color, title) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setAlert({ visible: true, color, title });
    timeoutRef.current = setTimeout(() => {
      setAlert({ visible: false, color: "default", title: "" });
    }, 4000);
  }, []);

  // --- Backend ---
  const obtenerTrabajadores = useCallback(async (searchTerm) => {
    setCargando(true);
    try {
      const res = await api.get("/workers/trabajadores", {
        params: { search: searchTerm },
        withCredentials: true,
      });
      setTrabajadores(res.data.trabajadores || []);
    } catch (error) {
      console.error("Error al obtener trabajadores:", error);
      showAlert("danger", "Error al obtener los trabajadores.");
      setTrabajadores([]);
    } finally {
      setCargando(false);
    }
  }, [showAlert]);

  const eliminarTrabajador = useCallback(async (id) => {
    if (!id) return;
    try {
      await api.delete(`/workers/eliminar-trabajador/${id}`, { withCredentials: true });
      obtenerTrabajadores(filtro);
      showAlert("success", "Trabajador eliminado exitosamente.");
    } catch (error) {
      console.error("Error al eliminar trabajador:", error);
      showAlert("danger", "Error al eliminar el trabajador.");
    }
  }, [obtenerTrabajadores, filtro, showAlert]);

  const desactivarTrabajador = useCallback(async (id) => {
    if (!id) return;
    try {
      await api.put(`/workers/desactivar-trabajador/${id}`, {}, { withCredentials: true });
      obtenerTrabajadores(filtro);
      showAlert("success", "Trabajador desactivado exitosamente.");
    } catch (error) {
      console.error("Error al desactivar trabajador:", error);
      showAlert("danger", "Error al desactivar el trabajador.");
    }
  }, [obtenerTrabajadores, filtro, showAlert]);

  const activarTrabajador = useCallback(async (id) => {
    if (!id) return;
    try {
      await api.put(`/workers/activar-trabajador/${id}`, {}, { withCredentials: true });
      obtenerTrabajadores(filtro);
      showAlert("success", "Trabajador activado exitosamente.");
    } catch (error) {
      console.error("Error al activar trabajador:", error);
      showAlert("danger", "Error al activar el trabajador.");
    }
  }, [obtenerTrabajadores, filtro, showAlert]);

  const actualizarTrabajador = useCallback(async (id, data) => {
    try {
      await api.put(`/workers/actualizar-trabajador/${id}`, data, { withCredentials: true });
      setEditingTrabajador(null);
      obtenerTrabajadores(filtro);
      showAlert("success", "Trabajador actualizado exitosamente.");
    } catch (error) {
      console.error("Error al actualizar trabajador:", error);
      const errorMsg = error.response?.data?.error || "Error al actualizar el trabajador.";
      showAlert("danger", errorMsg);
    }
  }, [obtenerTrabajadores, filtro, showAlert]);

  // --- Effects ---
  useEffect(() => {
    const delay = setTimeout(() => {
      obtenerTrabajadores(filtro);
    }, 400);
    return () => {
      clearTimeout(delay);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [filtro, obtenerTrabajadores, refresh]);

  return (
    <div className="max-w-full p-3 sm:p-4 md:p-6">
      {/* Buscador */}
      <div className="flex flex-col gap-3 mb-4 sm:flex-row sm:items-center sm:justify-between">
        <Input
          type="text"
          placeholder="Buscar trabajador por nombre o usuario"
          value={filtro}
          onChange={(e) => setFiltro(e.target.value)}
          className="w-full sm:max-w-md"
          startContent={<SearchIcon className="text-gray-500" />}
        />
        <div className="px-1 text-xs sm:text-sm text-gray-600">{trabajadores.length} resultados</div>
      </div>

      {cargando ? (
        <div className="flex items-center justify-center h-64">
          <Spinner label="Cargando trabajadores..." color="primary" />
        </div>
      ) : (
        <div className="w-full overflow-x-auto">
          <Table
            aria-label="Tabla de trabajadores"
            removeWrapper
            isStriped
            classNames={{
              table: "bg-white min-w-full overflow-x-auto",
              th: "bg-gradient-to-r from-gray-900 to-red-900 text-white text-[10px] sm:text-xs font-semibold text-center px-2 sm:px-3 py-1 sm:py-2",
              td: "text-gray-800 border-b border-gray-200 align-middle text-[11px] sm:text-sm px-2 sm:px-3 py-1 sm:py-2",
              tr: "hover:bg-gray-50 transition-colors",
            }}
          >
            <TableHeader>
              <TableColumn className="min-w-[150px]">NOMBRE</TableColumn>
              <TableColumn className="text-center min-w-[120px]">DOCUMENTO</TableColumn>
              <TableColumn className="text-center hidden sm:table-cell">USUARIO</TableColumn>
              <TableColumn className="text-center hidden md:table-cell">CONTRASEÑA</TableColumn>
              <TableColumn className="text-center">ROL</TableColumn>
              <TableColumn className="text-center">ACTIVO</TableColumn>
              <TableColumn className="min-w-[120px]">ACCIONES</TableColumn>
            </TableHeader>

            <TableBody items={trabajadores} emptyContent={"No hay trabajadores encontrados."}>
              {(trab) => (
                <TableRow key={trab._id}>
                  <TableCell>
                    <div className="flex items-center gap-1 sm:gap-2">
                      <CoPresentRoundedIcon sx={{ color: "#555", fontSize: { xs: 20, sm: 24, md: 28 } }} />
                      <span className="text-xs sm:text-sm">{trab.nombre}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-center text-xs sm:text-sm">
                    {trab.tipoDocumento && trab.numeroDocumento 
                      ? `${trab.tipoDocumento}: ${trab.numeroDocumento}` 
                      : "-"}
                  </TableCell>
                  <TableCell className="text-center hidden sm:table-cell text-xs sm:text-sm">{trab.nombreUsuario}</TableCell>
                  <TableCell className="text-center hidden md:table-cell">
                    <span className="text-xs sm:text-sm">{"********"}</span>
                  </TableCell>
                  <TableCell className="text-center text-xs sm:text-sm">{trab.rol}</TableCell>
                  <TableCell className="text-center">
                    <Chip color={trab.activo ? "success" : "danger"} variant="flat">
                      {trab.activo ? "Activo" : "Inactivo"}
                    </Chip>
                  </TableCell>
                  <TableCell>
                    <div className="relative flex items-center justify-center gap-1 sm:gap-2 md:gap-3">
                      <Tooltip content="Editar Trabajador">
                        <BotonEditar onClick={() => setEditingTrabajador(trab)} />
                      </Tooltip>
                      {trab.activo ? (
                        <Tooltip content="Desactivar" color="warning">
                          <Button
                            isIconOnly
                            variant="light"
                            size="sm"
                            onPress={() => desactivarTrabajador(trab._id)}
                            className="text-yellow-600"
                          >
                            <CancelPresentationRoundedIcon className="text-base sm:text-lg" />
                          </Button>
                        </Tooltip>
                      ) : (
                        <Tooltip content="Activar" color="success">
                          <Button
                            isIconOnly
                            variant="light"
                            size="sm"
                            onPress={() => activarTrabajador(trab._id)}
                            className="text-green-600"
                          >
                            <PlayCircleOutlineRoundedIcon className="text-base sm:text-lg" />
                          </Button>
                        </Tooltip>
                      )}
                      <Tooltip content="Eliminar" color="danger">
                        <BotonEliminar onClick={() => eliminarTrabajador(trab._id)} />
                      </Tooltip>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}

      {alert.visible && (
        <div className="fixed z-50 bottom-5 right-5">
          <Alert color={alert.color} title={alert.title} />
        </div>
      )}

      {editingTrabajador && (
        <ModalEditarTrabajador
          key={editingTrabajador._id}
          trabajador={editingTrabajador}
          onClose={() => setEditingTrabajador(null)}
          onUpdate={actualizarTrabajador}
        />
      )}
    </div>
  );
}