import React, { useEffect, useState } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  useDisclosure,
  Spinner,
  Alert,
  Input,
  Select,
  SelectItem,
} from "@heroui/react";
import api from "../../utils/axiosInstance";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import ConfirmacionAlert from "../Alerta/ConfirmacionAlert";

const ModalviewMembresia = ({ onClose }) => {
  const { isOpen, onOpenChange } = useDisclosure({ defaultOpen: true });
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [alerta, setAlerta] = useState({ show: false, type: "", message: "", title: "" });
  const [confirmacionEliminar, setConfirmacionEliminar] = useState({ isOpen: false, membresiaId: null, membresiaInfo: null });
  const [editandoMembresia, setEditandoMembresia] = useState(null);
  const [formEdicion, setFormEdicion] = useState({ duracion: "", precio: "", turno: "" });
  const [loadingEliminar, setLoadingEliminar] = useState(false);
  const [loadingEditar, setLoadingEditar] = useState(false);

  useEffect(() => {
    if (!isOpen && onClose) onClose();
  }, [isOpen, onClose]);

  const mostrarAlerta = (type, title, message) => {
    setAlerta({ show: true, type, title, message });
    setTimeout(() => setAlerta({ show: false, type: "", message: "", title: "" }), 5000);
  };

  // Traer membresías
  useEffect(() => {
    const fetchMembresias = async () => {
      if (!isOpen) return;
      setLoading(true);
      setError(null);
      try {
        const response = await api.get("/plans/vermembresia", {
          withCredentials: true,
          timeout: 10000,
        });
        setData(response.data);
      } catch (err) {
        if (err.response) {
          setError(`Error del servidor: ${err.response.data.error || err.response.statusText}`);
        } else if (err.request) {
          setError("Error de conexión con el servidor");
        } else {
          setError("Error desconocido");
        }
      } finally {
        setLoading(false);
      }
    };
    fetchMembresias();
  }, [isOpen]);

  // Abrir modal de confirmación para eliminar
  const abrirConfirmacionEliminar = async (membresia) => {
    setLoadingEliminar(true);
    try {
      // Primero verificar cuántos clientes usan esta membresía
      const response = await api.get(`/plans/verificarclientes/${membresia._id}`, {
        withCredentials: true,
      });
      
      const clientesUsando = response.data.clientesUsando || 0;
      
      // Si hay clientes usando la membresía, mostrar confirmación con información
      if (clientesUsando > 0) {
        setConfirmacionEliminar({
          isOpen: true,
          membresiaId: membresia._id,
          membresiaInfo: membresia,
          clientesUsando: clientesUsando,
          mensaje: `Esta membresía está siendo utilizada por ${clientesUsando} cliente${clientesUsando > 1 ? 's' : ''}. Por favor, actualiza o elimina primero los clientes que la usan.`
        });
      } else {
        // No hay clientes, mostrar confirmación simple
        setConfirmacionEliminar({
          isOpen: true,
          membresiaId: membresia._id,
          membresiaInfo: membresia,
          clientesUsando: 0,
          mensaje: "¿Estás seguro de que deseas eliminar esta membresía?"
        });
      }
    } catch (err) {
      mostrarAlerta("danger", "Error", err.response?.data?.error || "Error al verificar la membresía.");
    } finally {
      setLoadingEliminar(false);
    }
  };

  // Confirmar eliminación
  const confirmarEliminar = async () => {
    // Si hay clientes usando la membresía, no permitir eliminación
    if (confirmacionEliminar.clientesUsando > 0) {
      mostrarAlerta("warning", "No se puede eliminar", confirmacionEliminar.mensaje);
      setConfirmacionEliminar({ isOpen: false, membresiaId: null, membresiaInfo: null });
      return;
    }

    setLoadingEliminar(true);
    try {
      await api.delete(`/plans/eliminarmembresia/${confirmacionEliminar.membresiaId}`, {
        withCredentials: true,
      });
      setData(prev => prev.filter(m => m._id !== confirmacionEliminar.membresiaId));
      mostrarAlerta("success", "¡Éxito!", "Membresía eliminada correctamente.");
      setConfirmacionEliminar({ isOpen: false, membresiaId: null, membresiaInfo: null });
    } catch (err) {
      if (err.response?.status === 400 && err.response?.data?.clientesUsando) {
        mostrarAlerta("warning", "No se puede eliminar", err.response.data.message);
      } else {
        mostrarAlerta("danger", "Error", err.response?.data?.error || "Error al eliminar la membresía.");
      }
    } finally {
      setLoadingEliminar(false);
    }
  };

  // Abrir modo edición (verificar primero si hay clientes)
  const abrirEdicion = async (membresia) => {
    setLoadingEditar(true);
    try {
      // Verificar cuántos clientes usan esta membresía
      const response = await api.get(`/plans/verificarclientes/${membresia._id}`, {
        withCredentials: true,
      });
      
      const clientesUsando = response.data.clientesUsando || 0;
      
      if (clientesUsando > 0) {
        mostrarAlerta(
          "warning", 
          "No se puede editar", 
          `Esta membresía está siendo utilizada por ${clientesUsando} cliente${clientesUsando > 1 ? 's' : ''}. Por favor, actualiza o elimina primero los clientes que la usan antes de modificar la membresía.`
        );
        setLoadingEditar(false);
        return;
      }

      // Si no hay clientes, permitir edición
      setEditandoMembresia(membresia._id);
      setFormEdicion({
        duracion: membresia.duracion.toString(),
        precio: membresia.precio.toString(),
        turno: membresia.turno
      });
    } catch (err) {
      mostrarAlerta("danger", "Error", err.response?.data?.error || "Error al verificar la membresía.");
    } finally {
      setLoadingEditar(false);
    }
  };

  // Cancelar edición
  const cancelarEdicion = () => {
    setEditandoMembresia(null);
    setFormEdicion({ duracion: "", precio: "", turno: "" });
  };

  // Guardar edición
  const guardarEdicion = async () => {
    if (!formEdicion.duracion || !formEdicion.precio || !formEdicion.turno) {
      mostrarAlerta("warning", "Campos requeridos", "Todos los campos son obligatorios.");
      return;
    }

    if (isNaN(formEdicion.duracion) || Number(formEdicion.duracion) <= 0) {
      mostrarAlerta("warning", "Duración inválida", "La duración debe ser un número positivo.");
      return;
    }

    if (isNaN(formEdicion.precio) || Number(formEdicion.precio) < 0) {
      mostrarAlerta("warning", "Precio inválido", "El precio debe ser un número válido.");
      return;
    }

    setLoadingEditar(true);
    try {
      await api.put(`/plans/actualizarmembresia/${editandoMembresia}`, {
        duracion: Number(formEdicion.duracion),
        precio: Number(formEdicion.precio),
        turno: formEdicion.turno
      }, {
        withCredentials: true,
      });

      // Actualizar la lista
      setData(prev => prev.map(m => 
        m._id === editandoMembresia 
          ? { ...m, duracion: Number(formEdicion.duracion), precio: Number(formEdicion.precio), turno: formEdicion.turno }
          : m
      ));
      
      mostrarAlerta("success", "¡Éxito!", "Membresía actualizada correctamente.");
      cancelarEdicion();
    } catch (err) {
      // Si el error es porque hay clientes usando la membresía
      if (err.response?.status === 400 && err.response?.data?.clientesUsando !== undefined) {
        mostrarAlerta("warning", "No se puede actualizar", err.response.data.message);
        cancelarEdicion();
      } else {
        mostrarAlerta("danger", "Error", err.response?.data?.error || "Error al actualizar la membresía.");
      }
    } finally {
      setLoadingEditar(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      hideCloseButton
      backdrop="blur"
      isDismissable={false}
      className="text-white bg-black"
    >
      <ModalContent>
        {modalClose => (
          <>
            <ModalHeader>
              <div className="w-full text-2xl font-bold text-center text-color-acentos">
                Membresías
              </div>
            </ModalHeader>

            <ModalBody className="space-y-4">
              {alerta.show && (
                <div className="mb-4">
                  <Alert
                    color={alerta.type}
                    title={alerta.title}
                    description={alerta.message}
                    variant="faded"
                    className="shadow-lg"
                  />
                </div>
              )}

              {/* Lista de Membresías */}
              {loading ? (
                <div className="flex items-center justify-center py-6">
                  <Spinner size="lg" color="default" />
                  <span className="ml-3 text-white">Cargando...</span>
                </div>
              ) : error ? (
                <div className="py-4 text-center text-red-400">{error}</div>
              ) : data.length > 0 ? (
                <div className="space-y-4 max-h-[400px] overflow-y-auto">
                  {data.map(m => (
                    <div
                      key={m._id}
                      className="p-3 transition-colors bg-gray-700 rounded-lg hover:bg-gray-600"
                    >
                      {editandoMembresia === m._id ? (
                        // Modo edición
                        <div className="space-y-3">
                          <Input
                            label="Duración (meses)"
                            type="number"
                            value={formEdicion.duracion}
                            onChange={(e) => setFormEdicion({ ...formEdicion, duracion: e.target.value })}
                            className="text-black"
                            min="1"
                            max="24"
                          />
                          <Select
                            label="Turno"
                            selectedKeys={formEdicion.turno ? [formEdicion.turno] : []}
                            onSelectionChange={(keys) => {
                              const selected = Array.from(keys)[0];
                              setFormEdicion({ ...formEdicion, turno: selected });
                            }}
                            className="text-black"
                          >
                            <SelectItem key="mañana" value="mañana">Mañana</SelectItem>
                            <SelectItem key="tarde" value="tarde">Tarde</SelectItem>
                            <SelectItem key="noche" value="noche">Noche</SelectItem>
                          </Select>
                          <Input
                            label="Precio"
                            type="number"
                            value={formEdicion.precio}
                            onChange={(e) => setFormEdicion({ ...formEdicion, precio: e.target.value })}
                            className="text-black"
                            min="0"
                          />
                          <div className="flex gap-2 justify-end">
                            <Button
                              onPress={cancelarEdicion}
                              variant="light"
                              size="sm"
                              className="text-white"
                              isDisabled={loadingEditar}
                            >
                              Cancelar
                            </Button>
                            <Button
                              onPress={guardarEdicion}
                              color="danger"
                              size="sm"
                              isLoading={loadingEditar}
                              isDisabled={loadingEditar}
                              className="text-white"
                            >
                              Guardar
                            </Button>
                          </div>
                        </div>
                      ) : (
                        // Modo visualización
                        <div className="flex items-center justify-between">
                          <div className="flex flex-col">
                            <span className="font-medium text-white">
                              {m.duracion === 12
                                ? "1 Año"
                                : `${m.duracion} Mes${m.duracion > 1 ? "es" : ""}`}
                            </span>
                            <span className="text-gray-300">Turno: {m.turno}</span>
                            <span className="font-semibold text-green-400">
                              S/ {Number(m.precio).toFixed(2)}
                            </span>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              onPress={() => abrirEdicion(m)}
                              className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
                              variant="light"
                              size="sm"
                              isIconOnly
                            >
                              <EditIcon />
                            </Button>
                            <Button
                              onPress={() => abrirConfirmacionEliminar(m)}
                              className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
                              variant="light"
                              size="sm"
                              isIconOnly
                              isDisabled={loadingEliminar}
                            >
                              <DeleteIcon />
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-400">No hay membresías registradas.</p>
              )}
            </ModalBody>

            <ModalFooter>
              <Button
                onPress={modalClose}
                className="text-white border-white"
                variant="light"
                color="danger"
              >
                Cerrar
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
      
      {/* Modal de confirmación para eliminar */}
      <ConfirmacionAlert
        isOpen={confirmacionEliminar.isOpen}
        onClose={() => setConfirmacionEliminar({ isOpen: false, membresiaId: null, membresiaInfo: null })}
        onConfirm={confirmarEliminar}
        title="Confirmar eliminación"
        message={confirmacionEliminar.mensaje || "¿Estás seguro de que deseas eliminar esta membresía?"}
        confirmText={confirmacionEliminar.clientesUsando > 0 ? "No se puede eliminar" : "Eliminar"}
        cancelText="Cerrar"
        variant="danger"
        loading={loadingEliminar}
        disableConfirm={confirmacionEliminar.clientesUsando > 0}
      />
    </Modal>
  );
};

export default ModalviewMembresia;