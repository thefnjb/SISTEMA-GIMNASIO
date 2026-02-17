import React, { useState, useEffect, useCallback } from 'react';
import {
  Modal,
  ModalContent,
  ModalBody,
  Button,
  Spinner,
  Chip,
  Pagination,
} from '@heroui/react';
import { Alert } from '@heroui/react';
import api from '../../utils/axiosInstance';
import MessageIcon from '@mui/icons-material/Message';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import CloseIcon from '@mui/icons-material/Close';
import ReplyIcon from '@mui/icons-material/Reply';

export default function ModalHistorialMensajes({ isOpen, onClose, trabajador }) {
  const [mensajes, setMensajes] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [alert, setAlert] = useState({ show: false, type: '', message: '' });

  const obtenerHistorial = useCallback(async (pageNum = 1) => {
    if (!trabajador?._id) return;
    
    setCargando(true);
    try {
      const res = await api.get('/mensajes/historial', {
        params: {
          destinatarioId: trabajador._id,
          page: pageNum,
          limit: 10,
        },
        withCredentials: true,
      });
      setMensajes(res.data.mensajes || []);
      setTotalPages(res.data.totalPages || 1);
      setTotal(res.data.total || 0);
    } catch (error) {
      console.error('Error al obtener historial:', error);
      mostrarAlerta('danger', 'Error al obtener el historial');
      setMensajes([]);
    } finally {
      setCargando(false);
    }
  }, [trabajador]);

  useEffect(() => {
    if (isOpen && trabajador?._id) {
      obtenerHistorial(page);
    }
  }, [isOpen, trabajador, page, obtenerHistorial]);

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

  if (!trabajador) return null;

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
                    className="p-2 rounded-lg shadow-lg"
                    style={{
                      background: 'linear-gradient(135deg, var(--color-botones, #D72838) 0%, #DC2626 100%)',
                    }}
                  >
                    <MessageIcon sx={{ fontSize: 28, color: 'white' }} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800">
                      Historial de Mensajes
                    </h2>
                    <p className="text-sm text-gray-600 mt-1">
                      {trabajador.nombre} - {total} mensaje{total !== 1 ? 's' : ''}
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

              {cargando ? (
                <div className="flex justify-center py-8">
                  <Spinner />
                </div>
              ) : mensajes.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No hay mensajes enviados a este trabajador
                </div>
              ) : (
                <div className="space-y-4">
                  {mensajes.map((mensaje) => (
                    <div key={mensaje._id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Chip
                            size="sm"
                            color={mensaje.tipo === 'alerta' ? 'warning' : 'default'}
                            variant="flat"
                          >
                            {mensaje.tipo === 'alerta' ? (
                              <NotificationsActiveIcon sx={{ fontSize: 14 }} />
                            ) : (
                              <MessageIcon sx={{ fontSize: 14 }} />
                            )}
                            {mensaje.tipo}
                          </Chip>
                          <Chip size="sm" color={getPrioridadColor(mensaje.prioridad)} variant="flat">
                            {mensaje.prioridad}
                          </Chip>
                        </div>
                        <span className="text-xs text-gray-500">
                          {formatearFecha(mensaje.createdAt)}
                        </span>
                      </div>
                      {mensaje.asunto && (
                        <p className="font-semibold text-sm text-gray-800 mb-2">
                          {mensaje.asunto}
                        </p>
                      )}
                      <p className="text-sm text-gray-700 mb-3">{mensaje.contenido}</p>
                      
                      {/* Respuestas */}
                      {mensaje.respuestas && mensaje.respuestas.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-gray-300 space-y-2">
                          {mensaje.respuestas.map((respuesta) => {
                            const esDelTrabajador = respuesta.remitente?.nombre && !respuesta.remitente?.nombreEmpresa;
                            return (
                              <div
                                key={respuesta._id}
                                className={`ml-4 p-2 rounded border ${
                                  esDelTrabajador
                                    ? 'bg-green-50 border-green-200'
                                    : 'bg-blue-50 border-blue-200'
                                }`}
                              >
                                <div className="flex items-center gap-1 mb-1">
                                  <ReplyIcon sx={{ fontSize: 12 }} />
                                  <span className="text-xs font-semibold text-gray-700">
                                    {esDelTrabajador ? 'Trabajador' : 'Tú'}:
                                  </span>
                                  <span className="text-xs text-gray-500">
                                    {formatearFecha(respuesta.createdAt)}
                                  </span>
                                </div>
                                <p className="text-sm text-gray-800">{respuesta.contenido}</p>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  ))}

                  {totalPages > 1 && (
                    <div className="flex justify-center mt-4">
                      <Pagination
                        total={totalPages}
                        page={page}
                        onChange={setPage}
                        color="danger"
                      />
                    </div>
                  )}
                </div>
              )}
            </ModalBody>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}

