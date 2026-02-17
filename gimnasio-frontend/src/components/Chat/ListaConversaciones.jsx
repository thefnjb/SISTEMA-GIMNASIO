import React, { useState, useEffect, useCallback } from 'react';
import { Button, Chip, Spinner, Card, CardBody } from '@heroui/react';
import api from '../../utils/axiosInstance';
import { Alert } from '@heroui/react';
import MessageIcon from '@mui/icons-material/Message';
import ReplyIcon from '@mui/icons-material/Reply';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import HistoryIcon from '@mui/icons-material/History';
import DeleteIcon from '@mui/icons-material/Delete';
import ChatAdmin from './ChatAdmin';
import ModalHistorialMensajes from './ModalHistorialMensajes';
import ConfirmacionAlert from '../Alerta/ConfirmacionAlert';

export default function ListaConversaciones() {
  const [conversaciones, setConversaciones] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [conversacionSeleccionada, setConversacionSeleccionada] = useState(null);
  const [mostrarChat, setMostrarChat] = useState(false);
  const [alert, setAlert] = useState({ show: false, type: '', message: '' });
  const [mostrarHistorial, setMostrarHistorial] = useState(false);
  const [trabajadorHistorial, setTrabajadorHistorial] = useState(null);
  const [confirmacionEliminar, setConfirmacionEliminar] = useState({ isOpen: false, trabajadorId: null });
  const [eliminando, setEliminando] = useState(false);

  const obtenerConversaciones = useCallback(async () => {
    setCargando(true);
    try {
      const res = await api.get('/mensajes/conversaciones', {
        withCredentials: true,
      });
      setConversaciones(res.data.conversaciones || []);
    } catch (error) {
      console.error('Error al obtener conversaciones:', error);
      mostrarAlerta('danger', 'Error al cargar conversaciones');
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    obtenerConversaciones();
    // Actualizar cada 30 segundos
    const interval = setInterval(obtenerConversaciones, 30000);
    return () => clearInterval(interval);
  }, [obtenerConversaciones]);

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

  const abrirChatConTrabajador = (trabajador) => {
    setConversacionSeleccionada(trabajador);
    setMostrarChat(true);
  };

  const abrirHistorial = (e, trabajador) => {
    if (e?.stopPropagation) e.stopPropagation();
    setTrabajadorHistorial(trabajador);
    setMostrarHistorial(true);
  };

  const eliminarConversacion = async () => {
    if (!confirmacionEliminar.trabajadorId) return;
    
    setEliminando(true);
    try {
      await api.delete(`/mensajes/conversacion/${confirmacionEliminar.trabajadorId}`, {
        withCredentials: true,
      });
      mostrarAlerta('success', 'Conversación eliminada exitosamente');
      setConfirmacionEliminar({ isOpen: false, trabajadorId: null });
      obtenerConversaciones();
    } catch (error) {
      console.error('Error al eliminar conversación:', error);
      mostrarAlerta('danger', error.response?.data?.error || 'Error al eliminar la conversación');
    } finally {
      setEliminando(false);
    }
  };

  const solicitarEliminar = (e, trabajadorId) => {
    if (e?.stopPropagation) e.stopPropagation();
    setConfirmacionEliminar({ isOpen: true, trabajadorId });
  };

  if (cargando) {
    return (
      <div className="flex justify-center items-center py-12">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {alert.show && (
        <Alert color={alert.type} title={alert.message} className="mb-4" variant="faded" />
      )}

      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Conversaciones</h2>
          <p className="text-sm text-gray-600 mt-1">
            {conversaciones.length} conversación{conversaciones.length !== 1 ? 'es' : ''}
          </p>
        </div>
        <Button
          color="danger"
          onPress={() => setMostrarChat(true)}
          startContent={<MessageIcon />}
          style={{
            backgroundColor: 'var(--color-botones, #D72838)',
          }}
        >
          Nuevo Mensaje
        </Button>
      </div>

      {conversaciones.length === 0 ? (
        <Card>
          <CardBody className="py-12">
            <div className="flex flex-col items-center justify-center text-center">
              <MessageIcon sx={{ fontSize: 64, color: '#ccc', mb: 2 }} />
              <p className="text-gray-500 text-lg">No hay conversaciones</p>
              <p className="text-gray-400 text-sm mt-2">
                Envía un mensaje a tus trabajadores para comenzar
              </p>
            </div>
          </CardBody>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {conversaciones.map((conversacion) => (
            <Card
              key={conversacion.trabajador._id}
              className="hover:shadow-lg transition-shadow cursor-pointer"
              isPressable
              onPress={() => abrirChatConTrabajador(conversacion.trabajador)}
            >
              <CardBody className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="flex-shrink-0">
                      <AccountCircleIcon sx={{ fontSize: 40, color: '#666' }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 truncate">
                        {conversacion.trabajador.nombre}
                      </h3>
                      <p className="text-xs text-gray-500 truncate">
                        @{conversacion.trabajador.nombreUsuario}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {conversacion.mensajesNoLeidos > 0 && (
                      <Chip size="sm" color="primary" variant="flat">
                        {conversacion.mensajesNoLeidos}
                      </Chip>
                    )}
                    <Button
                      isIconOnly
                      size="sm"
                      variant="light"
                      color="primary"
                      onPress={(e) => abrirHistorial(e, conversacion.trabajador)}
                      className="min-w-0 w-8 h-8"
                    >
                      <HistoryIcon sx={{ fontSize: 18 }} />
                    </Button>
                    <Button
                      isIconOnly
                      size="sm"
                      variant="light"
                      color="danger"
                      onPress={(e) => solicitarEliminar(e, conversacion.trabajador._id)}
                      className="min-w-0 w-8 h-8"
                    >
                      <DeleteIcon sx={{ fontSize: 18 }} />
                    </Button>
                  </div>
                </div>

                <div className="space-y-2 mb-3">
                  {conversacion.ultimoMensaje && (
                    <div className="bg-gray-50 rounded-lg p-2">
                      <div className="flex items-center gap-2 mb-1">
                        <Chip
                          size="sm"
                          color={
                            conversacion.ultimoMensaje.tipo === 'alerta'
                              ? 'warning'
                              : 'default'
                          }
                          variant="flat"
                        >
                          {conversacion.ultimoMensaje.tipo === 'alerta' ? (
                            <NotificationsActiveIcon sx={{ fontSize: 12, mr: 0.5 }} />
                          ) : (
                            <MessageIcon sx={{ fontSize: 12, mr: 0.5 }} />
                          )}
                          {conversacion.ultimoMensaje.tipo}
                        </Chip>
                        <Chip
                          size="sm"
                          color={getPrioridadColor(conversacion.ultimoMensaje.prioridad)}
                          variant="flat"
                        >
                          {conversacion.ultimoMensaje.prioridad}
                        </Chip>
                      </div>
                      {conversacion.ultimoMensaje.asunto && (
                        <p className="text-xs font-semibold text-gray-800 mb-1">
                          {conversacion.ultimoMensaje.asunto}
                        </p>
                      )}
                      <p className="text-xs text-gray-700 line-clamp-2">
                        {conversacion.ultimoMensaje.contenido}
                      </p>
                      {conversacion.ultimoMensaje.respuesta && (
                        <div className="mt-2 pt-2 border-t border-gray-200">
                          <div className="flex items-center gap-1 mb-1">
                            <ReplyIcon sx={{ fontSize: 12, color: '#666' }} />
                            <span className="text-xs font-semibold text-gray-600">Respuesta:</span>
                          </div>
                          <p className="text-xs text-gray-700 line-clamp-2">
                            {conversacion.ultimoMensaje.respuesta}
                          </p>
                        </div>
                      )}
                      <p className="text-xs text-gray-400 mt-1">
                        {formatearFecha(conversacion.ultimoMensaje.createdAt)}
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>
                    {conversacion.totalMensajes} mensaje{conversacion.totalMensajes !== 1 ? 's' : ''}
                  </span>
                  {conversacion.tieneRespuestas && (
                    <Chip size="sm" color="success" variant="flat">
                      Con respuesta
                    </Chip>
                  )}
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      )}

      {mostrarChat && (
        <ChatAdmin
          isOpen={mostrarChat}
          onClose={() => {
            setMostrarChat(false);
            setConversacionSeleccionada(null);
            obtenerConversaciones();
          }}
          trabajadorInicial={conversacionSeleccionada}
        />
      )}

      {mostrarHistorial && (
        <ModalHistorialMensajes
          isOpen={mostrarHistorial}
          onClose={() => {
            setMostrarHistorial(false);
            setTrabajadorHistorial(null);
          }}
          trabajador={trabajadorHistorial}
        />
      )}

      <ConfirmacionAlert
        isOpen={confirmacionEliminar.isOpen}
        onClose={() => setConfirmacionEliminar({ isOpen: false, trabajadorId: null })}
        onConfirm={eliminarConversacion}
        title="Confirmar eliminación"
        message="¿Estás seguro de que deseas eliminar toda la conversación con este trabajador? Esta acción no se puede deshacer."
        confirmText="Eliminar"
        cancelText="Cancelar"
        variant="danger"
        loading={eliminando}
      />
    </div>
  );
}

