import { useState, useEffect, useCallback } from "react";
import {
  Modal,
  ModalContent,
  ModalBody,
  ModalFooter,
  Button,
  Spinner,
  Chip,
  Pagination,
  Input,
  Select,
  SelectItem,
} from "@heroui/react";
import { Alert } from "@heroui/react";
import api from "../../utils/axiosInstance";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import LoginIcon from "@mui/icons-material/Login";
import LogoutIcon from "@mui/icons-material/Logout";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import DeleteIcon from "@mui/icons-material/Delete";
import FilterListIcon from "@mui/icons-material/FilterList";
import ConfirmacionAlert from "../Alerta/ConfirmacionAlert";

export default function ModalHistorialAsistencia({ trabajador, isOpen, onClose }) {
  const [registros, setRegistros] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [alert, setAlert] = useState({ visible: false, color: "default", title: "" });
  const [filtroFecha, setFiltroFecha] = useState("");
  const [filtroMes, setFiltroMes] = useState("");
  const [filtroAño, setFiltroAño] = useState(new Date().getFullYear().toString());
  const [mostrarFiltros, setMostrarFiltros] = useState(false);
  const [confirmacionEliminar, setConfirmacionEliminar] = useState({ isOpen: false, registroId: null });
  const [eliminando, setEliminando] = useState(false);

  const showAlert = useCallback((color, title) => {
    setAlert({ visible: true, color, title });
    setTimeout(() => {
      setAlert({ visible: false, color: "default", title: "" });
    }, 4000);
  }, []);

  const obtenerHistorial = useCallback(async (pageNum = 1, forceRefresh = false) => {
    if (!trabajador?._id) return;
    
    setCargando(true);
    try {
      const params = { page: pageNum, limit: 10 };
      
      if (filtroFecha) {
        params.fechaInicio = filtroFecha;
      } else if (filtroMes && filtroAño) {
        params.mes = filtroMes;
        params.año = filtroAño;
      }

      const res = await api.get(`/workers/historial-asistencia/${trabajador._id}`, {
        params,
        withCredentials: true,
      });
      setRegistros(res.data.registros || []);
      setTotalPages(res.data.totalPages || 1);
      setTotal(res.data.total || 0);
    } catch (error) {
      console.error("Error al obtener historial:", error);
      showAlert("danger", "Error al obtener el historial de asistencia.");
      setRegistros([]);
    } finally {
      setCargando(false);
    }
  }, [trabajador, filtroFecha, filtroMes, filtroAño, showAlert]);

  useEffect(() => {
    if (isOpen && trabajador?._id) {
      obtenerHistorial(page);
    }
  }, [isOpen, trabajador, page, obtenerHistorial]);

  const eliminarRegistro = async () => {
    if (!confirmacionEliminar.registroId) return;

    setEliminando(true);
    try {
      await api.delete(`/workers/eliminar-registro-asistencia/${confirmacionEliminar.registroId}`, {
        withCredentials: true,
      });
      showAlert("success", "Registro eliminado exitosamente.");
      setConfirmacionEliminar({ isOpen: false, registroId: null });
      
      // Actualizar el estado local primero
      const nuevaTotal = Math.max(0, total - 1);
      setTotal(nuevaTotal);
      
      // Calcular nueva página si es necesario
      const nuevaTotalPages = Math.ceil(nuevaTotal / 10) || 1;
      setTotalPages(nuevaTotalPages);
      
      // Ajustar página si es necesario
      let paginaActual = page;
      if (page > nuevaTotalPages && nuevaTotalPages > 0) {
        paginaActual = nuevaTotalPages;
        setPage(nuevaTotalPages);
      }
      
      // Refrescar la lista después de eliminar
      await obtenerHistorial(paginaActual);
    } catch (error) {
      console.error("Error al eliminar registro:", error);
      const errorMsg = error.response?.data?.error || "Error al eliminar el registro.";
      showAlert("danger", errorMsg);
    } finally {
      setEliminando(false);
    }
  };

  const limpiarFiltros = () => {
    setFiltroFecha("");
    setFiltroMes("");
    setFiltroAño(new Date().getFullYear().toString());
    setPage(1);
  };

  const aplicarFiltros = () => {
    setPage(1);
    obtenerHistorial(1);
  };

  const formatFecha = (fecha) => {
    if (!fecha) return "-";
    const date = new Date(fecha);
    return date.toLocaleDateString("es-PE", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const formatHora = (fecha) => {
    if (!fecha) return "-";
    const date = new Date(fecha);
    return date.toLocaleTimeString("es-PE", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const calcularDuracion = (entrada, salida) => {
    if (!entrada || !salida) return "-";
    const inicio = new Date(entrada);
    const fin = new Date(salida);
    const diff = fin - inicio;
    
    const horas = Math.floor(diff / (1000 * 60 * 60));
    const minutos = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const segundos = Math.floor((diff % (1000 * 60)) / 1000);
    
    const minutosFinales = minutos + (segundos > 0 ? 1 : 0);
    
    return `${horas}h ${minutosFinales}m`;
  };

  const descargarPDF = async () => {
    if (!trabajador?._id) return;
    
    try {
      const token = sessionStorage.getItem('token');
      let url = `http://localhost:4000/workers/reporte-asistencia-pdf/${trabajador._id}?`;
      
      if (filtroFecha) {
        url += `fechaInicio=${filtroFecha}`;
      } else if (filtroMes && filtroAño) {
        url += `mes=${filtroMes}&año=${filtroAño}`;
      }

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Error al generar el PDF');
      }

      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = `reporte_asistencia_${trabajador.nombreUsuario}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(downloadUrl);
      document.body.removeChild(a);
      
      showAlert("success", "PDF descargado exitosamente.");
    } catch (error) {
      console.error("Error al descargar PDF:", error);
      showAlert("danger", "Error al descargar el PDF.");
    }
  };

  const descargarExcel = async () => {
    if (!trabajador?._id) return;
    
    try {
      const token = sessionStorage.getItem('token');
      let url = `http://localhost:4000/workers/reporte-asistencia-excel/${trabajador._id}?`;
      
      if (filtroFecha) {
        url += `fechaInicio=${filtroFecha}`;
      } else if (filtroMes && filtroAño) {
        url += `mes=${filtroMes}&año=${filtroAño}`;
      }

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Error al generar el Excel');
      }

      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = `reporte_asistencia_${trabajador.nombreUsuario}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(downloadUrl);
      document.body.removeChild(a);
      
      showAlert("success", "Excel descargado exitosamente.");
    } catch (error) {
      console.error("Error al descargar Excel:", error);
      showAlert("danger", "Error al descargar el Excel.");
    }
  };

  const meses = [
    { value: "1", label: "Enero" },
    { value: "2", label: "Febrero" },
    { value: "3", label: "Marzo" },
    { value: "4", label: "Abril" },
    { value: "5", label: "Mayo" },
    { value: "6", label: "Junio" },
    { value: "7", label: "Julio" },
    { value: "8", label: "Agosto" },
    { value: "9", label: "Septiembre" },
    { value: "10", label: "Octubre" },
    { value: "11", label: "Noviembre" },
    { value: "12", label: "Diciembre" },
  ];

  const años = Array.from({ length: 5 }, (_, i) => {
    const año = new Date().getFullYear() - i;
    return { value: año.toString(), label: año.toString() };
  });

  if (!trabajador) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="2xl"
      backdrop="blur"
      scrollBehavior="inside"
      classNames={{
        base: "bg-white",
        header: "bg-transparent p-0",
        body: "py-6",
      }}
    >
      <ModalContent>
        <div className="px-6 pt-6 pb-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className="p-2 rounded-lg shadow-lg"
                style={{
                  background: "linear-gradient(135deg, var(--color-botones, #D72838) 0%, #DC2626 100%)",
                }}
              >
                <AccessTimeIcon sx={{ fontSize: 28, color: "white" }} />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-800">
                  Historial de Asistencia
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  {trabajador.nombre} - {total} registro{total !== 1 ? "s" : ""}
                </p>
              </div>
            </div>
            <Button
              size="sm"
              variant="flat"
              onPress={() => setMostrarFiltros(!mostrarFiltros)}
              className="flex items-center gap-2"
            >
              <FilterListIcon sx={{ fontSize: 18 }} />
              Filtros
            </Button>
          </div>
        </div>

        <ModalBody>
          {alert.visible && (
            <div className="mb-4">
              <Alert 
                color={alert.color} 
                title={alert.title} 
                variant="faded"
                isClosable
                onClose={() => setAlert({ visible: false, color: "default", title: "" })}
              />
            </div>
          )}

          {mostrarFiltros && (
            <div className="bg-gray-50 p-4 rounded-lg mb-4 border border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Fecha Exacta
                  </label>
                  <Input
                    type="date"
                    value={filtroFecha}
                    onChange={(e) => setFiltroFecha(e.target.value)}
                    size="sm"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Mes
                  </label>
                  <Select
                    selectedKeys={filtroMes ? [filtroMes] : []}
                    onSelectionChange={(keys) => {
                      const selected = Array.from(keys)[0];
                      setFiltroMes(selected || "");
                    }}
                    size="sm"
                    placeholder="Seleccionar mes"
                  >
                    {meses.map((mes) => (
                      <SelectItem key={mes.value} value={mes.value}>
                        {mes.label}
                      </SelectItem>
                    ))}
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Año
                  </label>
                  <Select
                    selectedKeys={[filtroAño]}
                    onSelectionChange={(keys) => {
                      const selected = Array.from(keys)[0];
                      setFiltroAño(selected || new Date().getFullYear().toString());
                    }}
                    size="sm"
                  >
                    {años.map((año) => (
                      <SelectItem key={año.value} value={año.value}>
                        {año.label}
                      </SelectItem>
                    ))}
                  </Select>
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <Button
                  size="sm"
                  onPress={aplicarFiltros}
                  className="text-white"
                  style={{ backgroundColor: "var(--color-botones)" }}
                >
                  Aplicar Filtros
                </Button>
                <Button
                  size="sm"
                  variant="flat"
                  onPress={limpiarFiltros}
                >
                  Limpiar
                </Button>
              </div>
            </div>
          )}

          {cargando ? (
            <div className="flex items-center justify-center h-64">
              <Spinner label="Cargando historial..." color="primary" />
            </div>
          ) : registros.length === 0 ? (
            <div className="text-center py-12">
              <AccessTimeIcon sx={{ fontSize: 64, color: "#ccc", mb: 2 }} />
              <p className="text-gray-500 text-lg">No hay registros de asistencia</p>
            </div>
          ) : (
            <div className="space-y-4">
              {registros.map((registro) => (
                <div
                  key={registro._id}
                  className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:shadow-md transition-shadow"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex items-center gap-2 text-green-600">
                          <LoginIcon sx={{ fontSize: 20 }} />
                          <span className="text-sm font-semibold">Entrada</span>
                        </div>
                        <div className="text-sm text-gray-700">
                          <span className="font-medium">{formatFecha(registro.fechaEntrada)}</span>
                          <span className="ml-2">{formatHora(registro.fechaEntrada)}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-2 text-red-600">
                          <LogoutIcon sx={{ fontSize: 20 }} />
                          <span className="text-sm font-semibold">Salida</span>
                        </div>
                        <div className="text-sm text-gray-700">
                          {registro.fechaSalida ? (
                            <>
                              <span className="font-medium">{formatFecha(registro.fechaSalida)}</span>
                              <span className="ml-2">{formatHora(registro.fechaSalida)}</span>
                            </>
                          ) : (
                            <Chip size="sm" color="warning" variant="flat">
                              Pendiente
                            </Chip>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-2">
                      {registro.fechaSalida && (
                        <div className="text-right">
                          <span className="text-xs text-gray-500">Duración</span>
                          <p className="text-sm font-semibold text-color-acentos">
                            {calcularDuracion(registro.fechaEntrada, registro.fechaSalida)}
                          </p>
                        </div>
                      )}
                      <Button
                        size="sm"
                        isIconOnly
                        variant="light"
                        color="danger"
                        onPress={() => setConfirmacionEliminar({ isOpen: true, registroId: registro._id })}
                      >
                        <DeleteIcon sx={{ fontSize: 18 }} />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {totalPages > 1 && (
            <div className="flex justify-center mt-6">
              <Pagination
                isCompact
                showControls
                color="primary"
                page={page}
                total={totalPages}
                onChange={(p) => setPage(p)}
              />
            </div>
          )}
        </ModalBody>

        {alert.visible && (
          <div className="fixed z-[9999] bottom-5 right-5">
            <Alert color={alert.color} title={alert.title} />
          </div>
        )}

        <ModalFooter className="flex justify-between gap-2">
          <div className="flex gap-2">
            <Button
              onPress={descargarPDF}
              className="text-white flex items-center gap-2"
              style={{ backgroundColor: "#dc2626" }}
              isDisabled={!trabajador?._id || registros.length === 0}
              size="sm"
            >
              <PictureAsPdfIcon sx={{ fontSize: 18 }} />
              PDF
            </Button>
            <Button
              onPress={descargarExcel}
              className="text-white flex items-center gap-2"
              style={{ backgroundColor: "#047857" }}
              isDisabled={!trabajador?._id || registros.length === 0}
              size="sm"
            >
              <FileDownloadIcon sx={{ fontSize: 18 }} />
              Excel
            </Button>
          </div>
          <Button
            onPress={onClose}
            className="text-white"
            style={{ backgroundColor: "var(--color-botones)" }}
            size="sm"
          >
            Cerrar
          </Button>
        </ModalFooter>
      </ModalContent>
      
      {/* Modal de confirmación para eliminar */}
      <ConfirmacionAlert
        isOpen={confirmacionEliminar.isOpen}
        onClose={() => setConfirmacionEliminar({ isOpen: false, registroId: null })}
        onConfirm={eliminarRegistro}
        title="Confirmar eliminación"
        message="¿Estás seguro de que deseas eliminar este registro de asistencia? Esta acción no se puede deshacer."
        confirmText="Eliminar"
        cancelText="Cancelar"
        variant="danger"
        loading={eliminando}
      />
    </Modal>
  );
}
