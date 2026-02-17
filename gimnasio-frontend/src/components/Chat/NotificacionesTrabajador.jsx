import React, { useState, useEffect, useCallback } from 'react';
import {
  Modal,
  ModalContent,
  ModalBody,
  Button,
  Chip,
  Spinner,
} from '@heroui/react';
import api from '../../utils/axiosInstance';
import { Alert } from '@heroui/react';
import NotificationsIcon from '@mui/icons-material/Notifications';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import MessageIcon from '@mui/icons-material/Message';
import CloseIcon from '@mui/icons-material/Close';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

export default function NotificacionesTrabajador({ isOpen, onClose }) {
  const [mensajes, setMensajes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [contadorNoLeidos, setContadorNoLeidos] = useState(0);
  const [alert, setAlert] = useState({ show: false, type: '', message: '' });

  const obtenerMensajes = useCallback(async () => {
    setCargando(true);
    try {
      const res = await api.get('/mensajes/mis-mensajes', {
        params: { limit: 100 },
        withCredentials: true,
      });
      setMensajes(res.data.mensajes || []);
    } catch (error) {
      console.error('Error al obtener mensajes:', error);
      mostrarAlerta('danger', 'Error al cargar mensajes');
    } finally {
      setCargando(false);
    }
  }, []);

  const obtenerContador = useCallback(async () => {
    try {
      const res = await api.get('/mensajes/contador-no-leidos', {
        withCredentials: true,
      });
      setContadorNoLeidos(res.data.contador || 0);
    } catch (error) {
      console.error('Error al obtener contador:', error);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      obtenerMensajes();
      obtenerContador();
    }
  }, [isOpen, obtenerMensajes, obtenerContador]);

  // Actualizar contador cada 30 segundos cuando el modal está abierto
  useEffect(() => {
    if (!isOpen) return;

    const interval = setInterval(() => {
      obtenerContador();
    }, 30000);

    return () => clearInterval(interval);
  }, [isOpen, obtenerContador]);

  const marcarComoLeido = async (mensajeId) => {
    try {
      await api.put(`/mensajes/marcar-leido/${mensajeId}`, {}, { withCredentials: true });
      setMensajes((prev) =>
        prev.map((msg) =>
          msg._id === mensajeId ? { ...msg, leido: true, fechaLeido: new Date() } : msg
        )
      );
      obtenerContador();
    } catch (error) {
      console.error('Error al marcar como leído:', error);
    }
  };

  const marcarTodosComoLeidos = async () => {
    try {
      await api.put('/mensajes/marcar-todos-leidos', {}, { withCredentials: true });
      setMensajes((prev) =>
        prev.map((msg) => ({ ...msg, leido: true, fechaLeido: new Date() }))
      );
      setContadorNoLeidos(0);
      mostrarAlerta('success', 'Todos los mensajes marcados como leídos');
    } catch (error) {
      console.error('Error al marcar todos como leídos:', error);
      mostrarAlerta('danger', 'Error al marcar los mensajes');
    }
  };

  // Los trabajadores no pueden eliminar mensajes, solo el administrador puede


  const mostrarAlerta = (type, message) => {
    setAlert({ show: true, type, message });
    setTimeout(() => {
      setAlert({ show: false, type: '', message: '' });
    }, 4000);
  };

  const formatearFecha = (fecha) => {
    return new Date(fecha).toLocaleString('es-PE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getPrioridadColor = (prioridad) => {
    switch (prioridad) {
      case 'urgente':
        return 'danger';
      case 'alta':
        return 'warning';
      default:
        return 'default';
    }
  };

  const mensajesNoLeidos = mensajes.filter((m) => !m.leido).length;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="2xl"
      backdrop="blur"
      scrollBehavior="inside"
      hideCloseButton={true}
      classNames={{
        base: 'bg-white',
        header: 'bg-transparent p-0',
        body: 'py-6',
      }}
    >
      <ModalContent>
        {(onCloseModal) => (
          <>
            <div className="px-6 pt-6 pb-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="p-2 rounded-lg shadow-lg relative"
                    style={{
                      background: 'linear-gradient(135deg, var(--color-botones, #D72838) 0%, #DC2626 100%)',
                    }}
                  >
                    <NotificationsIcon sx={{ fontSize: 28, color: 'white' }} />
                    {contadorNoLeidos > 0 && (
                      <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                        {contadorNoLeidos > 9 ? '9+' : contadorNoLeidos}
                      </div>
                    )}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800">Mis Mensajes</h2>
                    <p className="text-sm text-gray-600 mt-1">
                      {mensajesNoLeidos > 0
                        ? `${mensajesNoLeidos} mensaje${mensajesNoLeidos > 1 ? 's' : ''} no leído${mensajesNoLeidos > 1 ? 's' : ''}`
                        : 'Todos los mensajes leídos'}
                    </p>
                  </div>
                </div>
                <Button
                  isIconOnly
                  variant="light"
                  onPress={onCloseModal}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <CloseIcon />
                </Button>
              </div>
            </div>

        <ModalBody>
          {alert.show && (
            <Alert color={alert.type} title={alert.message} className="mb-4" variant="faded" />
          )}

          {mensajesNoLeidos > 0 && (
            <div className="mb-4">
              <Button
                size="sm"
                color="success"
                variant="flat"
                onPress={marcarTodosComoLeidos}
                startContent={<CheckCircleIcon />}
              >
                Marcar todos como leídos
              </Button>
            </div>
          )}

          {cargando ? (
            <div className="flex justify-center py-8">
              <Spinner />
            </div>
          ) : mensajes.length === 0 ? (
            <div className="text-center py-12">
              <NotificationsIcon sx={{ fontSize: 64, color: '#ccc', mb: 2 }} />
              <p className="text-gray-500">No tienes mensajes</p>
            </div>
          ) : (
            <div className="space-y-3">
              {mensajes.map((mensaje) => (
                <div
                  key={mensaje._id}
                  className={`rounded-lg p-4 border-2 transition-all ${
                    mensaje.leido
                      ? 'bg-gray-50 border-gray-200'
                      : 'bg-blue-50 border-blue-300 shadow-sm'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Chip
                        size="sm"
                        color={mensaje.tipo === 'alerta' ? 'warning' : 'default'}
                        variant="flat"
                      >
                        {mensaje.tipo === 'alerta' ? (
                          <NotificationsActiveIcon sx={{ fontSize: 14, mr: 0.5 }} />
                        ) : (
                          <MessageIcon sx={{ fontSize: 14, mr: 0.5 }} />
                        )}
                        {mensaje.tipo === 'alerta' ? 'Alerta' : 'Mensaje'}
                      </Chip>
                      <Chip size="sm" color={getPrioridadColor(mensaje.prioridad)} variant="flat">
                        {mensaje.prioridad}
                      </Chip>
                      {!mensaje.leido && (
                        <Chip size="sm" color="primary" variant="flat">
                          Nuevo
                        </Chip>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500">
                        {formatearFecha(mensaje.createdAt)}
                      </span>
                    </div>
                  </div>

                  {mensaje.asunto && (
                    <p className="font-semibold text-base text-gray-800 mb-2">{mensaje.asunto}</p>
                  )}

                  <p className="text-sm text-gray-700 mb-3">{mensaje.contenido}</p>

                  <div className="flex items-center gap-2 flex-wrap">
                    {!mensaje.leido && (
                      <Button
                        size="sm"
                        color="success"
                        variant="flat"
                        onPress={() => marcarComoLeido(mensaje._id)}
                        startContent={<CheckCircleIcon />}
                      >
                        Marcar como leído
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </ModalBody>
        </>
        )}
      </ModalContent>
    </Modal>
  );
}

// Hook para usar el contador de notificaciones en otros componentes
export function useContadorNotificaciones() {
  const [contador, setContador] = useState(0);

  const obtenerContador = useCallback(async () => {
    try {
      const res = await api.get('/mensajes/contador-no-leidos', {
        withCredentials: true,
      });
      setContador(res.data.contador || 0);
    } catch (error) {
      console.error('Error al obtener contador:', error);
    }
  }, []);

  useEffect(() => {
    obtenerContador();
    const interval = setInterval(obtenerContador, 30000); // Actualizar cada 30 segundos
    return () => clearInterval(interval);
  }, [obtenerContador]);

  return contador;
}

