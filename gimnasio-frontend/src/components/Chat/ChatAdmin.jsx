import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Modal,
  ModalContent,
  ModalBody,
  Button,
  Input,
  Select,
  SelectItem,
  Textarea,
} from '@heroui/react';
import api from '../../utils/axiosInstance';
import { Alert } from '@heroui/react';
import SendIcon from '@mui/icons-material/Send';
import MessageIcon from '@mui/icons-material/Message';
import CloseIcon from '@mui/icons-material/Close';

export default function ChatAdmin({ isOpen, onClose, trabajadorInicial = null }) {
  const [trabajadores, setTrabajadores] = useState([]);
  const [trabajadorSeleccionado, setTrabajadorSeleccionado] = useState(null);
  const [enviarATodos, setEnviarATodos] = useState(false);
  const [tipo, setTipo] = useState('mensaje');
  const [asunto, setAsunto] = useState('');
  const [contenido, setContenido] = useState('');
  const [prioridad, setPrioridad] = useState('normal');
  const [cargando, setCargando] = useState(false);
  const [alert, setAlert] = useState({ show: false, type: '', message: '' });
  
  // Refs para evitar refrescos innecesarios
  const ultimoTrabajadorInicialIdRef = useRef(null);

  const obtenerTrabajadores = useCallback(async () => {
    try {
      const res = await api.get('/workers/trabajadores', {
        withCredentials: true,
      });
      // La API retorna { trabajadores: [...], total: ... }
      setTrabajadores(res.data?.trabajadores || res.data || []);
    } catch (error) {
      console.error('Error al obtener trabajadores:', error);
      mostrarAlerta('danger', 'Error al cargar trabajadores');
      setTrabajadores([]); // Asegurar que siempre sea un array
    }
  }, []);

  // Cargar trabajadores solo cuando se abre el modal por primera vez
  useEffect(() => {
    if (isOpen && trabajadores.length === 0) {
      obtenerTrabajadores();
    }
  }, [isOpen, obtenerTrabajadores, trabajadores.length]);

  // Establecer trabajador inicial solo cuando cambia el ID
  useEffect(() => {
    if (!isOpen) {
      // Resetear refs cuando se cierra el modal
      ultimoTrabajadorInicialIdRef.current = null;
      return;
    }

    const trabajadorInicialId = trabajadorInicial?._id || null;
    
    // Solo actualizar si el ID del trabajador inicial cambió
    if (trabajadorInicialId !== ultimoTrabajadorInicialIdRef.current) {
      ultimoTrabajadorInicialIdRef.current = trabajadorInicialId;
      
      if (trabajadorInicialId) {
        setTrabajadorSeleccionado(trabajadorInicial);
        setEnviarATodos(false);
      } else {
        setTrabajadorSeleccionado(null);
        setEnviarATodos(false);
      }
    }
  }, [isOpen, trabajadorInicial?._id, trabajadorInicial]);

  const enviarMensaje = async () => {
    if (!contenido.trim()) {
      mostrarAlerta('danger', 'El contenido del mensaje es requerido');
      return;
    }

    if (!enviarATodos && !trabajadorSeleccionado) {
      mostrarAlerta('danger', 'Selecciona un trabajador o marca "Enviar a todos"');
      return;
    }

    setCargando(true);
    try {
      if (enviarATodos) {
        await api.post(
          '/mensajes/enviar-todos',
          {
            tipo,
            asunto,
            contenido,
            prioridad,
          },
          { withCredentials: true }
        );
        mostrarAlerta('success', 'Mensaje enviado a todos los trabajadores');
      } else {
        await api.post(
          '/mensajes/enviar',
          {
            destinatarioId: trabajadorSeleccionado._id,
            tipo,
            asunto,
            contenido,
            prioridad,
          },
          { withCredentials: true }
        );
        mostrarAlerta('success', 'Mensaje enviado exitosamente');
      }

      // Limpiar formulario
      setContenido('');
      setAsunto('');
      setTipo('mensaje');
      setPrioridad('normal');
    } catch (error) {
      console.error('Error al enviar mensaje:', error);
      mostrarAlerta('danger', error.response?.data?.error || 'Error al enviar el mensaje');
    } finally {
      setCargando(false);
    }
  };

  const mostrarAlerta = (type, message) => {
    setAlert({ show: true, type, message });
    setTimeout(() => {
      setAlert({ show: false, type: '', message: '' });
    }, 4000);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="3xl"
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
                    <h2 className="text-2xl font-bold text-gray-800">Enviar Mensaje/Alerta</h2>
                    <p className="text-sm text-gray-600 mt-1">Comunícate con tus trabajadores</p>
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

          <div className="space-y-4 max-w-2xl mx-auto">
            {/* Formulario */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="enviarATodos"
                checked={enviarATodos}
                onChange={(e) => {
                  setEnviarATodos(e.target.checked);
                  if (e.target.checked) {
                    setTrabajadorSeleccionado(null);
                  }
                }}
                className="w-4 h-4"
              />
              <label htmlFor="enviarATodos" className="text-sm font-medium text-gray-700">
                Enviar a todos los trabajadores
              </label>
            </div>

            {!enviarATodos && (
              <Select
                label="Seleccionar Trabajador"
                placeholder="Elige un trabajador"
                selectedKeys={trabajadorSeleccionado ? new Set([trabajadorSeleccionado._id]) : new Set()}
                onSelectionChange={(keys) => {
                  const selectedId = Array.from(keys)[0];
                  if (selectedId) {
                    const trabajador = trabajadores.find((t) => t._id === selectedId);
                    setTrabajadorSeleccionado(trabajador || null);
                  } else {
                    setTrabajadorSeleccionado(null);
                  }
                }}
                selectionMode="single"
                disallowEmptySelection={false}
                className="w-full"
              >
                {Array.isArray(trabajadores) && trabajadores.map((trabajador) => (
                  <SelectItem 
                    key={trabajador._id} 
                    textValue={`${trabajador.nombre} (${trabajador.nombreUsuario})`}
                  >
                    {trabajador.nombre} ({trabajador.nombreUsuario})
                  </SelectItem>
                ))}
              </Select>
            )}

            <Select
              label="Tipo"
              selectedKeys={[tipo]}
              onSelectionChange={(keys) => setTipo(Array.from(keys)[0])}
              className="w-full"
            >
              <SelectItem key="mensaje" value="mensaje">
                Mensaje
              </SelectItem>
              <SelectItem key="alerta" value="alerta">
                Alerta
              </SelectItem>
            </Select>

            <Input
              label="Asunto (opcional)"
              placeholder="Ej: Reunión importante"
              value={asunto}
              onChange={(e) => setAsunto(e.target.value)}
              className="w-full"
            />

            <Select
              label="Prioridad"
              selectedKeys={[prioridad]}
              onSelectionChange={(keys) => setPrioridad(Array.from(keys)[0])}
              className="w-full"
            >
              <SelectItem key="normal" value="normal">
                Normal
              </SelectItem>
              <SelectItem key="alta" value="alta">
                Alta
              </SelectItem>
              <SelectItem key="urgente" value="urgente">
                Urgente
              </SelectItem>
            </Select>

            <Textarea
              label="Contenido"
              placeholder="Escribe tu mensaje aquí..."
              value={contenido}
              onChange={(e) => setContenido(e.target.value)}
              minRows={4}
              className="w-full"
              required
            />

            <Button
              color="danger"
              onPress={enviarMensaje}
              isLoading={cargando}
              className="w-full"
              startContent={!cargando && <SendIcon />}
              style={{
                backgroundColor: 'var(--color-botones, #D72838)',
              }}
            >
              {enviarATodos ? 'Enviar a Todos' : 'Enviar Mensaje'}
            </Button>
          </div>
        </ModalBody>
        </>
        )}
      </ModalContent>
    </Modal>
  );
}

