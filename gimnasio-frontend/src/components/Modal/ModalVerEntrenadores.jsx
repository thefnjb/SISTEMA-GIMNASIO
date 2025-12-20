import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  useDisclosure,
  Alert,
  Input,
  Spinner
} from "@heroui/react";
import { useState, useEffect, useCallback, useRef } from "react";
import api from "../../utils/axiosInstance";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera"; 
import { IconButton } from "@mui/material";
import ConfirmacionAlert from "../Alerta/ConfirmacionAlert"; // <-- agregado

const ModalVerEntrenadores = ({ triggerText, refresh }) => {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [entrenadores, setEntrenadores] = useState([]);
  const [loading, setLoading] = useState(false);

  // 🔹 Estado de alerta interna
  const [alertaInterna, setAlertaInterna] = useState({
    show: false,
    type: "default",
    message: "",
  });

  // 🔹 Estados del modal de edición
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editandoEntrenador, setEditandoEntrenador] = useState(null);
  const [formEdicion, setFormEdicion] = useState({
    nombre: "",
    edad: "",
    telefono: "",
  });
  const [loadingEditar, setLoadingEditar] = useState(false);

  // 🔹 Estado para confirmación/eliminación con info de clientes usando la membresía
  const [confirmacionEliminar, setConfirmacionEliminar] = useState({
    isOpen: false,
    entrenadorId: null,
    entrenadorInfo: null,
    clientesUsando: 0,
    mensaje: "",
  });
  const [loadingEliminar, setLoadingEliminar] = useState(false);
  // 🆕 Modal para ver imagen
  const [isViewImageOpen, setIsViewImageOpen] = useState(false);
  const [imagenSeleccionada, setImagenSeleccionada] = useState(null);
  const fileInputRef = useRef(null);
  const [loadingImagen, setLoadingImagen] = useState(false);

  // 🔹 Mostrar alerta dentro del modal de edición
  const mostrarAlertaInterna = useCallback((type, message) => {
    setAlertaInterna({ show: true, type, message });
    setTimeout(() => {
      setAlertaInterna({ show: false, type: "default", message: "" });
    }, 3000);
  }, []);

  // 🔹 Traer entrenadores
  const fetchEntrenadores = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("/trainers/ver", { withCredentials: true });
      setEntrenadores(res.data);
    } catch (err) {
      console.error("Error al cargar entrenadores:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) fetchEntrenadores();
  }, [isOpen, refresh, fetchEntrenadores]);

  // 🔹 Abrir confirmación para eliminar (verifica miembros)
  const abrirConfirmacionEliminar = async (entrenador) => {
    setLoadingEliminar(true);
    try {
      const res = await api.get(`/trainers/verificarclientes/${entrenador._id}`, {
        withCredentials: true,
      });
      const miembrosUsando = res.data.miembrosUsando ?? res.data.clientesUsando ?? 0;

      if (miembrosUsando > 0) {
        setConfirmacionEliminar({
          isOpen: true,
          entrenadorId: entrenador._id,
          entrenadorInfo: entrenador,
          clientesUsando: miembrosUsando,
          mensaje: `Este entrenador está siendo utilizado por ${miembrosUsando} miembro${miembrosUsando > 1 ? "s" : ""}. Por favor, actualiza o elimina primero los miembros que lo usan.`,
        });
      } else {
        setConfirmacionEliminar({
          isOpen: true,
          entrenadorId: entrenador._id,
          entrenadorInfo: entrenador,
          clientesUsando: 0,
          mensaje: "¿Estás seguro de que deseas eliminar este entrenador?",
        });
      }
    } catch (err) {
      console.error("Error al verificar entrenador:", err);
      mostrarAlertaInterna("danger", "Error al verificar el entrenador.");
    } finally {
      setLoadingEliminar(false);
    }
  };
    // 🆕 Abrir modal de visualización de imagen
  const abrirImagenEntrenador = (entrenador) => {
    setImagenSeleccionada(entrenador);
    setIsViewImageOpen(true);
  };
  // 🆕 Al seleccionar nueva imagen desde los archivos
  const handleImagenSeleccionada = async (e) => {
    const file = e.target.files[0];
    if (!file || !imagenSeleccionada) return;

    const formData = new FormData();
    formData.append("fotoPerfil", file);

    setLoadingImagen(true);
    try {
      const res = await api.put(`/trainers/actualizarfoto/${imagenSeleccionada._id}`, formData, {
  withCredentials: true,
  headers: { "Content-Type": "multipart/form-data" },
});

      mostrarAlertaInterna("success", "Imagen actualizada correctamente.");
      // Actualizar lista
      fetchEntrenadores();

      // Actualizar la imagen mostrada en el modal sin cerrar
      setImagenSeleccionada((prev) => ({
        ...prev,
        fotoPerfil: res.data.fotoPerfil,
      }));
    } catch (err) {
      console.error("Error al actualizar imagen:", err);
      mostrarAlertaInterna("danger", "No se pudo actualizar la imagen.");
    } finally {
      setLoadingImagen(false);
    }
  };


  // 🔹 Confirmar eliminación
  const confirmarEliminar = async () => {
    if (confirmacionEliminar.clientesUsando > 0) {
      mostrarAlertaInterna("warning", confirmacionEliminar.mensaje);
      setConfirmacionEliminar({ isOpen: false, entrenadorId: null, entrenadorInfo: null, clientesUsando: 0, mensaje: "" });
      return;
    }

    setLoadingEliminar(true);
    try {
      await api.delete(`/trainers/eliminar/${confirmacionEliminar.entrenadorId}`, { withCredentials: true });
      setEntrenadores(prev => prev.filter(ent => ent._id !== confirmacionEliminar.entrenadorId));
      mostrarAlertaInterna("success", "Entrenador eliminado correctamente.");
      setConfirmacionEliminar({ isOpen: false, entrenadorId: null, entrenadorInfo: null, clientesUsando: 0, mensaje: "" });
    } catch (err) {
      console.error("Error al eliminar entrenador:", err);
      mostrarAlertaInterna("danger", "No se pudo eliminar el entrenador.");
    } finally {
      setLoadingEliminar(false);
    }
  };

  // 🔹 Abrir modal de edición (verifica primero si hay miembros usando al entrenador)
  const abrirEdicion = async (entrenador) => {
    setLoadingEditar(true);
    try {
      /* const res = await api.get(`/trainers/verificarclientes/${entrenador._id}`, {
        withCredentials: true,
      });
      const miembrosUsando = res.data.miembrosUsando ?? res.data.clientesUsando ?? 0;

      // Si está en uso: mostrar mensaje EN EL MISMO modal principal y NO abrir el modal de edición
      if (miembrosUsando > 0) {
        mostrarAlertaInterna(
          "warning",
          `No se puede editar. Este entrenador está siendo utilizado por ${miembrosUsando} miembro${miembrosUsando > 1 ? "s" : ""}. Por favor, actualiza o elimina primero los miembros que lo usan.`
        );
        setLoadingEditar(false);
        return;
      } */

      // Si no está en uso: preparar formulario y abrir modal de edición
      setFormEdicion({
        nombre: entrenador.nombre,
        edad: entrenador.edad?.toString() ?? "",
        telefono: entrenador.telefono ?? "",
      });
      setEditandoEntrenador(entrenador._id);
      setIsEditModalOpen(true);
    } catch (err) {
      console.error("Error al verificar entrenador:", err);
      mostrarAlertaInterna("danger", "Error al verificar el entrenador.");
    } finally {
      setLoadingEditar(false);
    }
  };

  // 🔹 Cancelar edición
  const cancelarEdicion = () => {
    setIsEditModalOpen(false);
    setEditandoEntrenador(null);
    setFormEdicion({ nombre: "", edad: "", telefono: "" });
    setAlertaInterna({ show: false, type: "default", message: "" });
  };

  // 🔹 Guardar cambios
  const guardarEdicion = async () => {
    if (!formEdicion.nombre || !formEdicion.edad || !formEdicion.telefono) {
      mostrarAlertaInterna("warning", "Completa todos los campos.");
      return;
    }

    if (!/^\d{9}$/.test(formEdicion.telefono)) {
      mostrarAlertaInterna("warning", "El teléfono debe tener 9 dígitos numéricos.");
      return;
    }

    if (Number(formEdicion.edad) <= 0) {
      mostrarAlertaInterna("warning", "La edad debe ser un número positivo.");
      return;
    }

    setLoadingEditar(true);
    try {
      await api.put(
        `/trainers/actualizar/${editandoEntrenador}`,
        {
          nombre: formEdicion.nombre.trim(),
          edad: Number(formEdicion.edad),
          telefono: formEdicion.telefono,
        },
        { withCredentials: true }
      );

      mostrarAlertaInterna("success", "¡Éxito! Entrenador editado correctamente.");
      setEditandoEntrenador(null);
      fetchEntrenadores();
      setTimeout(() => cancelarEdicion(), 1200);
    } catch (err) {
      console.error("Error al editar entrenador:", err);

      if (
        err.response?.data?.error?.includes("teléfono") ||
        err.response?.data?.code === 11000
      ) {
        mostrarAlertaInterna("danger", "Este número de teléfono ya está registrado.");
        return;
      }

      mostrarAlertaInterna("danger", "Error al editar entrenador. Intenta nuevamente.");
    } finally {
      setLoadingEditar(false);
    }
  };

  return (
    <>
      <Button
        onPress={onOpen}
        className="text-white transition-all"
        style={{ backgroundColor: 'var(--color-botones)' }}
      >
        {triggerText}
      </Button>

      {/* 🧩 Modal principal */}
      <Modal
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        backdrop="blur"
        className="text-white bg-black"
      >
        <ModalContent>
          <ModalHeader>
            <div className="w-full text-2xl font-bold text-center text-color-acentos">
              Lista de Entrenadores
            </div>
          </ModalHeader>

          <ModalBody>
            {alertaInterna.show && (
              <div className="mb-4">
                <Alert
                  color={alertaInterna.type}
                  description={alertaInterna.message}
                  variant="faded"
                  className="shadow-lg"
                />
              </div>
            )}
            {loading ? (
              <div className="flex justify-center py-6">
                <Spinner size="lg" color="default" />
              </div>
            ) : entrenadores.length === 0 ? (
              <p className="text-center text-gray-400">No hay entrenadores registrados.</p>
            ) : (
              <div className="flex flex-col gap-4">
                {entrenadores.map((entrenador) => (
                  <div
                    key={entrenador._id}
                    className="flex items-center justify-between p-4 transition border rounded-xl bg-white/10 border-white/20"
                  >
                    <div className="flex items-center gap-4">
                      <img
                        src={entrenador.fotoPerfil}
                        alt={entrenador.nombre}
                        className="w-16 h-16 rounded-full object-cover cursor-pointer hover:opacity-80 transition"
                        onClick={() => abrirImagenEntrenador(entrenador)} // 🆕
                      />

                      <div>
                        <h3 className="text-lg font-semibold text-white">
                          {entrenador.nombre}
                        </h3>
                        <p className="text-sm text-gray-300">
                          Edad: {entrenador.edad} | Tel: {entrenador.telefono}
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <IconButton
                        onClick={() => abrirEdicion(entrenador)}
                        sx={{ 
                          color: "var(--color-acentos)", 
                          "&:hover": { opacity: 0.7 } 
                        }}
                      >
                        <EditIcon />
                      </IconButton>

                      <IconButton
                        onClick={() => abrirConfirmacionEliminar(entrenador)}
                        sx={{ 
                          color: "var(--color-acentos)", 
                          "&:hover": { opacity: 0.7 } 
                        }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ModalBody>

          <ModalFooter>
            <Button
              color="danger"
              variant="light"
              onPress={() => onOpenChange(false)}
              className="text-white border-white"
            >
              Cerrar
            </Button>
          </ModalFooter>
          {/* 🆕 Modal para ver y editar imagen */}
<Modal
  isOpen={isViewImageOpen}
  onOpenChange={() => setIsViewImageOpen(false)}
  backdrop="blur"
  className="bg-black text-white flex justify-center items-center"
>
  <ModalContent>
    <ModalHeader>
      <div className="w-full text-2xl font-bold text-center text-red-500">
        Imagen del Entrenador
      </div>
    </ModalHeader>
    <ModalBody className="flex flex-col items-center justify-center gap-4">
      {imagenSeleccionada ? (
        <>
          <div className="relative">
            <img
              src={imagenSeleccionada.fotoPerfil}
              alt={imagenSeleccionada.nombre}
              className="w-64 h-64 rounded-xl object-cover border border-white/30 shadow-lg"
            />
            <IconButton
              onClick={() => fileInputRef.current.click()}
              sx={{
                position: "absolute",
                bottom: 10,
                right: 10,
                backgroundColor: "rgba(0,0,0,0.6)",
                "&:hover": { backgroundColor: "rgba(0,0,0,0.8)" },
              }}
            >
              <PhotoCameraIcon sx={{ color: "white" }} />
            </IconButton>
          </div>

          <input
            type="file"
            ref={fileInputRef}
            accept="image/*"
            onChange={handleImagenSeleccionada}
            style={{ display: "none" }}
          />

          <p className="text-gray-300">{imagenSeleccionada.nombre}</p>

          {loadingImagen && <Spinner color="danger" />}
        </>
      ) : (
        <p>No hay imagen seleccionada.</p>
      )}
    </ModalBody>

    <ModalFooter>
      <Button
        color="danger"
        variant="light"
        onPress={() => setIsViewImageOpen(false)}
        className="text-white"
      >
        Cerrar
      </Button>
    </ModalFooter>
  </ModalContent>
</Modal>

        </ModalContent>
      </Modal>

      {/* 🧩 Modal de edición */}
      <Modal
        isOpen={isEditModalOpen}
        onOpenChange={cancelarEdicion}
        backdrop="blur"
        className="bg-black text-white"
      >
        <ModalContent>
          <ModalHeader>
            <div className="w-full text-2xl font-bold text-center text-color-acentos">
              Editar Entrenador
            </div>
          </ModalHeader>

             <ModalBody>
            {alertaInterna.show && (
              <div className="mb-4">
                <Alert
                  color={alertaInterna.type}
                  description={alertaInterna.message}
                  variant="faded"
                  className="shadow-lg"
                />
              </div>
            )}
            <Input
              label="Nombre"
              value={formEdicion.nombre}
              onChange={(e) =>
                setFormEdicion({ ...formEdicion, nombre: e.target.value })
              }
              className="text-black"
            />
            <Input
              label="Edad"
              type="number"
              value={formEdicion.edad}
              onChange={(e) =>
                setFormEdicion({ ...formEdicion, edad: e.target.value })
              }
              className="text-black"
            />
            <Input
              label="Teléfono"
              value={formEdicion.telefono}
              maxLength={9}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, "").slice(0, 9);
                setFormEdicion({ ...formEdicion, telefono: value });
              }}
              className="text-black"
            />
          </ModalBody>

          <ModalFooter>
            <Button onPress={cancelarEdicion} variant="light" className="text-white">
              Cancelar
            </Button>
            <Button
              onPress={guardarEdicion}
              color="danger"
              className="text-white"
              isLoading={loadingEditar}
            >
              Guardar
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Confirmación eliminación (reutiliza componente existente) */}
      <ConfirmacionAlert
        isOpen={confirmacionEliminar.isOpen}
        onClose={() => setConfirmacionEliminar({ isOpen: false, entrenadorId: null, entrenadorInfo: null, clientesUsando: 0, mensaje: "" })}
        onConfirm={confirmarEliminar}
        title="Confirmar eliminación"
        message={confirmacionEliminar.mensaje || "¿Estás seguro de que deseas eliminar este entrenador?"}
        confirmText={confirmacionEliminar.clientesUsando > 0 ? "No se puede eliminar" : "Eliminar"}
        cancelText="Cerrar"
        variant="danger"
        loading={loadingEliminar}
        disableConfirm={confirmacionEliminar.clientesUsando > 0}
      />
    </>
  );
};

export default ModalVerEntrenadores;
