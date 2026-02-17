import React, { useState, useEffect } from 'react';
import api from '../../utils/axiosInstance';
import SettingsIcon from '@mui/icons-material/Settings';
import SaveIcon from '@mui/icons-material/Save';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import DeleteIcon from '@mui/icons-material/Delete';
import BusinessIcon from '@mui/icons-material/Business';
import EmailIcon from '@mui/icons-material/Email';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PaletteIcon from '@mui/icons-material/Palette';
import InfoIcon from '@mui/icons-material/Info';
import TableChartIcon from '@mui/icons-material/TableChart';
import DashboardIcon from '@mui/icons-material/Dashboard';
import RadioButtonCheckedIcon from '@mui/icons-material/RadioButtonChecked';
import ViewModuleIcon from '@mui/icons-material/ViewModule';

function ConfiguracionEmpresa() {
  const [cargando, setCargando] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState({ tipo: '', texto: '' });
  const [previewLogo, setPreviewLogo] = useState(null);
  const [datosEmpresa, setDatosEmpresa] = useState({
    nombreEmpresa: '',
    email: '',
    logoEmpresa: null,
    plantillaColor: 'porDefecto',
    colorSistema: '#D72838',
    colorBotones: '#D72838',
    colorCards: '#ffffff',
    colorTablas: '#D72838',
    colorAcentos: '#D72838',
    precioClientePorDia: 7,
    precioTurnoManana: 80,
    precioTurnoTarde: 100,
    precioTurnoNoche: 120
  });
  const [plantillas, setPlantillas] = useState([]);

  // Cargar datos de la empresa y plantillas al montar el componente
  useEffect(() => {
    cargarDatosEmpresa();
    cargarPlantillas();
  }, []);

  const cargarPlantillas = async () => {
    try {
      const response = await api.get('/gym/plantillas-colores');
      if (response.data.success) {
        setPlantillas(response.data.plantillas);
      }
    } catch (error) {
      console.error('Error al cargar plantillas:', error);
    }
  };

  const cargarDatosEmpresa = async () => {
    setCargando(true);
    try {
      const response = await api.get('/gym/datos-empresa');
      if (response.data.success) {
        const empresa = response.data.empresa;
        setDatosEmpresa({
          nombreEmpresa: empresa.nombreEmpresa || '',
          email: empresa.email || '',
          logoEmpresa: empresa.logoEmpresa || null,
          plantillaColor: empresa.plantillaColor || 'porDefecto',
          colorSistema: empresa.colorSistema || '#D72838',
          colorBotones: empresa.colorBotones || '#D72838',
          colorCards: empresa.colorCards || '#ffffff',
          colorTablas: empresa.colorTablas || '#D72838',
          colorAcentos: empresa.colorAcentos || '#D72838',
          precioClientePorDia: empresa.precioClientePorDia || 7,
          precioTurnoManana: empresa.precioTurnoManana || 80,
          precioTurnoTarde: empresa.precioTurnoTarde || 100,
          precioTurnoNoche: empresa.precioTurnoNoche || 120
        });
        setPreviewLogo(empresa.logoEmpresa || null);
      }
    } catch (error) {
      console.error('Error al cargar datos:', error);
      setMensaje({
        tipo: 'error',
        texto: 'Error al cargar los datos de la empresa'
      });
    } finally {
      setCargando(false);
    }
  };

  const handleSeleccionarPlantilla = (plantillaId) => {
    const plantilla = plantillas.find(p => p.id === plantillaId);
    if (plantilla) {
      setDatosEmpresa(prev => ({
        ...prev,
        plantillaColor: plantillaId,
        colorSistema: plantilla.colorSistema,
        colorBotones: plantilla.colorBotones,
        colorCards: plantilla.colorCards,
        colorTablas: plantilla.colorTablas,
        colorAcentos: plantilla.colorAcentos
      }));
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setDatosEmpresa(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validar tipo de archivo
      if (!file.type.startsWith('image/')) {
        setMensaje({
          tipo: 'error',
          texto: 'Por favor selecciona un archivo de imagen válido'
        });
        return;
      }

      // Validar tamaño (máximo 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setMensaje({
          tipo: 'error',
          texto: 'La imagen no debe superar los 5MB'
        });
        return;
      }

      // Crear preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewLogo(reader.result);
        setDatosEmpresa(prev => ({
          ...prev,
          logoEmpresa: reader.result // data URL
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const eliminarLogo = () => {
    setPreviewLogo(null);
    setDatosEmpresa(prev => ({
      ...prev,
      logoEmpresa: null
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGuardando(true);
    setMensaje({ tipo: '', texto: '' });

    try {
      // Validaciones
      if (!datosEmpresa.nombreEmpresa.trim()) {
        setMensaje({
          tipo: 'error',
          texto: 'El nombre de la empresa es requerido'
        });
        setGuardando(false);
        return;
      }

      if (!datosEmpresa.email.trim()) {
        setMensaje({
          tipo: 'error',
          texto: 'El email es requerido'
        });
        setGuardando(false);
        return;
      }

      // Preparar datos para enviar
      const datosEnviar = {
        nombreEmpresa: datosEmpresa.nombreEmpresa.trim(),
        email: datosEmpresa.email.trim().toLowerCase(),
        plantillaColor: datosEmpresa.plantillaColor,
        logoEmpresa: datosEmpresa.logoEmpresa && datosEmpresa.logoEmpresa.startsWith('data:') 
          ? datosEmpresa.logoEmpresa 
          : null,
        precioClientePorDia: parseFloat(datosEmpresa.precioClientePorDia) || 7,
        precioTurnoManana: parseFloat(datosEmpresa.precioTurnoManana) || 80,
        precioTurnoTarde: parseFloat(datosEmpresa.precioTurnoTarde) || 100,
        precioTurnoNoche: parseFloat(datosEmpresa.precioTurnoNoche) || 120
      };

      const response = await api.put('/gym/datos-empresa', datosEnviar);

      if (response.data.success) {
        setMensaje({
          tipo: 'exito',
          texto: 'Datos actualizados correctamente'
        });
        // Actualizar preview con la respuesta del servidor
        if (response.data.empresa.logoEmpresa) {
          setPreviewLogo(response.data.empresa.logoEmpresa);
        }
        // Aplicar los nuevos colores del sistema a las variables CSS inmediatamente
        const colores = response.data.empresa;
        
        // Aplicar colores de forma síncrona e inmediata
        const aplicarColoresInmediatamente = () => {
          if (colores.colorSistema) {
            document.documentElement.style.setProperty('--color-sistema', colores.colorSistema);
          }
          if (colores.colorBotones) {
            document.documentElement.style.setProperty('--color-botones', colores.colorBotones);
          }
          if (colores.colorCards) {
            document.documentElement.style.setProperty('--color-cards', colores.colorCards);
          }
          if (colores.colorTablas) {
            document.documentElement.style.setProperty('--color-tablas', colores.colorTablas);
          }
          if (colores.colorAcentos) {
            document.documentElement.style.setProperty('--color-acentos', colores.colorAcentos);
          }
        };

        // Aplicar inmediatamente
        aplicarColoresInmediatamente();

        // Disparar eventos de actualización de manera inmediata y con delay para asegurar actualización
        // Primero disparar eventos inmediatos
        window.dispatchEvent(new CustomEvent('coloresActualizados', {
          detail: { colores: colores }
        }));
        
        // Disparar evento para actualizar datos de la empresa (nombre, logo, email, etc.)
        window.dispatchEvent(new CustomEvent('datosEmpresaActualizados', {
          detail: { empresa: response.data.empresa }
        }));

        // Usar setTimeout para asegurar que el servidor haya procesado los cambios
        setTimeout(() => {
          // Disparar evento para recargar datos desde el servidor
          window.dispatchEvent(new Event('recargarColores'));
          window.dispatchEvent(new Event('datosEmpresaActualizados'));
          
          // Forzar re-renderizado de componentes
          window.dispatchEvent(new Event('resize'));
        }, 100);

        // Pequeña pausa para mostrar el mensaje de éxito
        await new Promise(resolve => setTimeout(resolve, 300));
      }
    } catch (error) {
      console.error('Error al guardar:', error);
      setMensaje({
        tipo: 'error',
        texto: error.response?.data?.error || 'Error al guardar los datos'
      });
    } finally {
      setGuardando(false);
    }
  };

  if (cargando) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 border-4 rounded-full border-color-botones border-t-transparent animate-spin"></div>
          <p className="text-lg font-semibold text-gray-600">Cargando datos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full min-h-screen p-4 xs:p-6 sm:p-8 lg:p-10 bg-gray-50">
      {/* Overlay de carga completo */}
      {guardando && (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-[9999] flex items-center justify-center backdrop-blur-sm">
          <div className="bg-white rounded-xl p-8 shadow-2xl flex flex-col items-center gap-4 min-w-[280px] max-w-[90%] animate-in fade-in zoom-in duration-200">
            <div 
              className="w-16 h-16 border-4 rounded-full animate-spin"
              style={{
                borderColor: `var(--color-botones)`,
                borderTopColor: 'transparent'
              }}
            ></div>
            <p className="text-lg font-semibold text-gray-700">Guardando cambios...</p>
            <p className="text-sm text-center text-gray-500">Aplicando los cambios en el sistema</p>
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto">
        {/* Header mejorado */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div 
              className="p-3 shadow-lg rounded-xl"
              style={{ 
                background: 'linear-gradient(135deg, var(--color-botones, #D72838) 0%, #DC2626 100%)'
              }}
            >
              <SettingsIcon className="text-white" fontSize="large" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-800 xs:text-4xl">
                Configuración de Empresa
              </h1>
              <p className="mt-1 text-sm text-gray-500">Gestiona la información y configuración de tu gimnasio</p>
            </div>
          </div>
        </div>

        {/* Mensajes mejorados */}
        {mensaje.texto && (
          <div
            className={`mb-6 p-4 rounded-xl shadow-md flex items-center gap-3 ${
              mensaje.tipo === 'exito'
                ? 'bg-green-50 text-green-800 border-l-4 border-green-500'
                : 'bg-red-50 text-red-800 border-l-4 border-red-500'
            }`}
          >
            <InfoIcon className={mensaje.tipo === 'exito' ? 'text-green-600' : 'text-red-600'} />
            <span className="font-medium">{mensaje.texto}</span>
          </div>
        )}

        {/* Formulario con diseño mejorado */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Sección 1: Información Básica */}
          <div className="p-6 bg-white border border-gray-200 shadow-md rounded-xl">
            <div className="flex items-center gap-3 pb-4 mb-6 border-b border-gray-200">
              <BusinessIcon className="text-color-botones" fontSize="large" />
              <h2 className="text-xl font-bold text-gray-800">Información Básica</h2>
            </div>
            
            <div className="space-y-6">
              {/* Logo de la empresa */}
              <div>
                <label className="block mb-3 text-sm font-semibold text-gray-700">
                  Logo de la Empresa
                </label>
                <div className="flex flex-col items-start gap-6 sm:flex-row">
                  {/* Preview del logo mejorado */}
                  <div className="relative group">
                    {previewLogo ? (
                      <div className="relative">
                        <div className="w-40 h-40 p-3 overflow-hidden bg-white border-2 border-gray-200 shadow-md xs:w-48 xs:h-48 rounded-xl">
                          <img
                            src={previewLogo}
                            alt="Logo de la empresa"
                            className="object-contain w-full h-full"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={eliminarLogo}
                          className="absolute p-2 text-white transition-all transform bg-red-500 rounded-full shadow-lg -top-2 -right-2 hover:bg-red-600 hover:scale-110"
                          title="Eliminar logo"
                        >
                          <DeleteIcon fontSize="small" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center w-40 h-40 gap-2 transition-colors border-2 border-gray-300 border-dashed xs:w-48 xs:h-48 rounded-xl bg-gray-50 hover:border-color-botones">
                        <PhotoCameraIcon className="text-gray-400" fontSize="large" />
                        <span className="text-xs text-gray-500">Sin logo</span>
                      </div>
                    )}
                  </div>

                  {/* Botón para subir imagen mejorado */}
                  <div className="flex flex-col justify-center flex-1">
                    <label className="inline-flex items-center justify-center gap-2 px-6 py-3 text-white transition-all transform rounded-lg shadow-md cursor-pointer bg-color-botones hover:bg-color-botones/90 hover:shadow-lg hover:scale-105">
                      <PhotoCameraIcon />
                      <span className="font-medium">Seleccionar Imagen</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                    </label>
                    <div className="p-3 mt-3 border border-blue-200 rounded-lg bg-blue-50">
                      <p className="text-xs text-blue-800">
                        <strong>Formatos aceptados:</strong> JPG, PNG, GIF<br />
                        <strong>Tamaño máximo:</strong> 5MB<br />
                        <strong>Recomendado:</strong> Imagen cuadrada para mejor visualización
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Nombre y Email en grid */}
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {/* Nombre de la empresa */}
                <div>
                  <label htmlFor="nombreEmpresa" className="flex items-center gap-2 mb-2 text-sm font-semibold text-gray-700">
                    <BusinessIcon className="text-color-botones" fontSize="small" />
                    Nombre de la Empresa *
                  </label>
                  <input
                    type="text"
                    id="nombreEmpresa"
                    name="nombreEmpresa"
                    value={datosEmpresa.nombreEmpresa}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 transition-all border border-gray-300 rounded-lg focus:ring-2 focus:ring-color-acentos focus:border-color-acentos"
                    placeholder="Ej: Gimnasio Terrones"
                    required
                  />
                </div>

                {/* Email */}
                <div>
                  <label htmlFor="email" className="flex items-center gap-2 mb-2 text-sm font-semibold text-gray-700">
                    <EmailIcon className="text-color-botones" fontSize="small" />
                    Email de la Empresa *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={datosEmpresa.email}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 transition-all border border-gray-300 rounded-lg focus:ring-2 focus:ring-color-acentos focus:border-color-acentos"
                    placeholder="empresa@gmail.com"
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Sección 2: Configuración de Precios */}
          <div className="p-6 bg-white border border-gray-200 shadow-md rounded-xl">
            <div className="flex items-center gap-3 pb-4 mb-6 border-b border-gray-200">
              <AttachMoneyIcon className="text-color-botones" fontSize="large" />
              <h2 className="text-xl font-bold text-gray-800">Configuración de Precios</h2>
            </div>
            
            <div className="space-y-6">
              {/* Precio Cliente por Día */}
              <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                <label htmlFor="precioClientePorDia" className="flex items-center gap-2 mb-2 text-sm font-semibold text-gray-700">
                  <AttachMoneyIcon className="text-color-botones" fontSize="small" />
                  Precio Cliente por Día (Soles) *
                </label>
                <div className="flex items-center gap-3">
                  <span className="text-xl font-bold text-gray-600">S/</span>
                  <div className="flex-1">
                    <input
                      type="number"
                      id="precioClientePorDia"
                      name="precioClientePorDia"
                      value={datosEmpresa.precioClientePorDia}
                      onChange={(e) => {
                        const value = parseFloat(e.target.value);
                        if (!isNaN(value) && value >= 0) {
                          setDatosEmpresa(prev => ({
                            ...prev,
                            precioClientePorDia: value
                          }));
                        } else if (e.target.value === '') {
                          setDatosEmpresa(prev => ({
                            ...prev,
                            precioClientePorDia: 0
                          }));
                        }
                      }}
                      min="0"
                      step="0.01"
                      className="w-full px-4 py-3 transition-all border border-gray-300 rounded-lg focus:ring-2 focus:ring-color-acentos focus:border-color-acentos"
                      placeholder="7.00"
                      required
                    />
                  </div>
                </div>
                <p className="flex items-center gap-1 mt-2 text-xs text-gray-600">
                  <InfoIcon fontSize="small" />
                  Este precio se aplicará automáticamente al registrar nuevos clientes por día
                </p>
              </div>

              {/* Precios de Turnos */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <AccessTimeIcon className="text-color-botones" />
                  <h3 className="text-lg font-bold text-gray-800">Precios de Turnos para Membresías</h3>
                </div>
                <p className="pl-8 mb-4 text-sm text-gray-600">
                  Configura los precios por defecto para cada turno. Estos precios se aplicarán automáticamente al crear nuevas membresías.
                </p>
                
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  {/* Precio Turno Mañana */}
                  <div className="p-4 transition-all border border-yellow-200 rounded-lg bg-gradient-to-br from-yellow-50 to-orange-50 hover:shadow-md">
                    <label htmlFor="precioTurnoManana" className="flex items-center gap-2 mb-2 text-sm font-semibold text-gray-700">
                      <span className="text-lg">🌅</span>
                      Turno Mañana *
                    </label>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-500">S/</span>
                      <input
                        type="number"
                        id="precioTurnoManana"
                        name="precioTurnoManana"
                        value={datosEmpresa.precioTurnoManana}
                        onChange={(e) => {
                          const value = parseFloat(e.target.value);
                          if (!isNaN(value) && value >= 0) {
                            setDatosEmpresa(prev => ({
                              ...prev,
                              precioTurnoManana: value
                            }));
                          } else if (e.target.value === '') {
                            setDatosEmpresa(prev => ({
                              ...prev,
                              precioTurnoManana: 0
                            }));
                          }
                        }}
                        min="0"
                        step="0.01"
                        className="flex-1 px-4 py-2 transition-all bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
                        placeholder="80.00"
                        required
                      />
                    </div>
                  </div>

                  {/* Precio Turno Tarde */}
                  <div className="p-4 transition-all border border-orange-200 rounded-lg bg-gradient-to-br from-orange-50 to-red-50 hover:shadow-md">
                    <label htmlFor="precioTurnoTarde" className="flex items-center gap-2 mb-2 text-sm font-semibold text-gray-700">
                      <span className="text-lg">🌆</span>
                      Turno Tarde *
                    </label>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-500">S/</span>
                      <input
                        type="number"
                        id="precioTurnoTarde"
                        name="precioTurnoTarde"
                        value={datosEmpresa.precioTurnoTarde}
                        onChange={(e) => {
                          const value = parseFloat(e.target.value);
                          if (!isNaN(value) && value >= 0) {
                            setDatosEmpresa(prev => ({
                              ...prev,
                              precioTurnoTarde: value
                            }));
                          } else if (e.target.value === '') {
                            setDatosEmpresa(prev => ({
                              ...prev,
                              precioTurnoTarde: 0
                            }));
                          }
                        }}
                        min="0"
                        step="0.01"
                        className="flex-1 px-4 py-2 transition-all bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-orange-400"
                        placeholder="100.00"
                        required
                      />
                    </div>
                  </div>

                  {/* Precio Turno Noche */}
                  <div className="p-4 transition-all border border-indigo-200 rounded-lg bg-gradient-to-br from-indigo-50 to-purple-50 hover:shadow-md">
                    <label htmlFor="precioTurnoNoche" className="flex items-center gap-2 mb-2 text-sm font-semibold text-gray-700">
                      <span className="text-lg">🌙</span>
                      Turno Noche *
                    </label>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-500">S/</span>
                      <input
                        type="number"
                        id="precioTurnoNoche"
                        name="precioTurnoNoche"
                        value={datosEmpresa.precioTurnoNoche}
                        onChange={(e) => {
                          const value = parseFloat(e.target.value);
                          if (!isNaN(value) && value >= 0) {
                            setDatosEmpresa(prev => ({
                              ...prev,
                              precioTurnoNoche: value
                            }));
                          } else if (e.target.value === '') {
                            setDatosEmpresa(prev => ({
                              ...prev,
                              precioTurnoNoche: 0
                            }));
                          }
                        }}
                        min="0"
                        step="0.01"
                        className="flex-1 px-4 py-2 transition-all bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400"
                        placeholder="120.00"
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sección 3: Personalización Visual */}
          <div className="p-6 bg-white border border-gray-200 shadow-md rounded-xl">
            <div className="flex items-center gap-3 pb-4 mb-6 border-b border-gray-200">
              <PaletteIcon className="text-color-botones" fontSize="large" />
              <h2 className="text-xl font-bold text-gray-800">Personalización Visual</h2>
            </div>
            
            <div className="space-y-4">
              <p className="pl-2 mb-6 text-sm text-gray-600">
                Selecciona una plantilla de colores predefinida para personalizar el aspecto de tu sistema. Los colores se aplicarán a botones, tablas y elementos principales de la interfaz.
              </p>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {plantillas.map((plantilla) => (
                <div
                  key={plantilla.id}
                  onClick={() => handleSeleccionarPlantilla(plantilla.id)}
                  className={`relative p-4 border-2 rounded-lg cursor-pointer transition-all hover:shadow-lg ${
                    datosEmpresa.plantillaColor === plantilla.id
                      ? 'border-red-600 shadow-lg'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  
                  {/* Preview de colores */}
                  <div className="mb-3">
                    <div className="flex h-16 gap-1 overflow-hidden border border-gray-300 rounded shadow-sm">
                      {/* Negro - Tablas (header) */}
                      <div className="relative flex flex-col items-center justify-center w-1/6 bg-black group">
                        <TableChartIcon className="text-xs text-white opacity-80" />
                        <span className="text-[8px] text-white opacity-70 mt-0.5 hidden group-hover:block absolute bottom-0.5 left-0 right-0 text-center">Tablas</span>
                      </div>
                      {/* Sistema (sidebar) */}
                      <div className="relative flex flex-col items-center justify-center flex-1 group" style={{ backgroundColor: plantilla.preview[0] }}>
                        <DashboardIcon className={`text-xs ${plantilla.preview[0] === '#ffffff' || plantilla.preview[0] === '#111827' ? 'text-gray-800' : 'text-white'} opacity-80`} />
                        <span className="text-[8px] mt-0.5 hidden group-hover:block absolute bottom-0.5 left-0 right-0 text-center" style={{ color: plantilla.preview[0] === '#ffffff' || plantilla.preview[0] === '#111827' ? '#1f2937' : 'white' }}>Sistema</span>
                      </div>
                      {/* Botones */}
                      <div className="relative flex flex-col items-center justify-center flex-1 group" style={{ backgroundColor: plantilla.preview[1] }}>
                        <RadioButtonCheckedIcon className={`text-xs ${plantilla.preview[1] === '#ffffff' || plantilla.preview[1] === '#111827' ? 'text-gray-800' : 'text-white'} opacity-80`} />
                        <span className="text-[8px] mt-0.5 hidden group-hover:block absolute bottom-0.5 left-0 right-0 text-center" style={{ color: plantilla.preview[1] === '#ffffff' || plantilla.preview[1] === '#111827' ? '#1f2937' : 'white' }}>Botones</span>
                      </div>
                      {/* Cards */}
                      <div className="relative flex flex-col items-center justify-center flex-1 group" style={{ backgroundColor: plantilla.preview[2] }}>
                        <ViewModuleIcon className={`text-xs ${plantilla.preview[2] === '#ffffff' || plantilla.preview[2] === '#111827' ? 'text-gray-800' : 'text-white'} opacity-80`} />
                        <span className="text-[8px] mt-0.5 hidden group-hover:block absolute bottom-0.5 left-0 right-0 text-center" style={{ color: plantilla.preview[2] === '#ffffff' || plantilla.preview[2] === '#111827' ? '#1f2937' : 'white' }}>Cards</span>
                      </div>
                      {/* Tablas */}
                      <div className="relative flex flex-col items-center justify-center flex-1 group" style={{ backgroundColor: plantilla.preview[3] }}>
                        <TableChartIcon className={`text-xs ${plantilla.preview[3] === '#ffffff' || plantilla.preview[3] === '#111827' ? 'text-gray-800' : 'text-white'} opacity-80`} />
                        <span className="text-[8px] mt-0.5 hidden group-hover:block absolute bottom-0.5 left-0 right-0 text-center" style={{ color: plantilla.preview[3] === '#ffffff' || plantilla.preview[3] === '#111827' ? '#1f2937' : 'white' }}>Tablas</span>
                      </div>
                      {/* Acentos */}
                      <div className="relative flex flex-col items-center justify-center flex-1 group" style={{ backgroundColor: plantilla.preview[4] }}>
                        <PaletteIcon className={`text-xs ${plantilla.preview[4] === '#ffffff' || plantilla.preview[4] === '#111827' ? 'text-gray-800' : 'text-white'} opacity-80`} />
                        <span className="text-[8px] mt-0.5 hidden group-hover:block absolute bottom-0.5 left-0 right-0 text-center" style={{ color: plantilla.preview[4] === '#ffffff' || plantilla.preview[4] === '#111827' ? '#1f2937' : 'white' }}>Acentos</span>
                      </div>
                    </div>
                    {/* Leyenda debajo del preview */}
                    <div className="mt-1 text-[9px] text-gray-500 text-center">
                      Pasa el mouse sobre cada color para ver su uso
                    </div>
                  </div>
                  
                  {/* Información de la plantilla */}
                  <div>
                    <h4 className="mb-1 font-semibold text-gray-800">{plantilla.nombre}</h4>
                    <p className="text-xs text-gray-500">{plantilla.descripcion}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          </div>

          {/* Botón de guardar mejorado */}
          <div className="p-6 bg-white border border-gray-200 shadow-md rounded-xl">
            <div className="flex items-center justify-center">
              <button
                type="submit"
                disabled={guardando}
                className={`flex items-center gap-2 px-8 py-3 bg-color-botones hover:bg-color-botones/90 text-white rounded-lg font-semibold transition-all shadow-lg hover:shadow-xl transform hover:scale-105 ${
                  guardando ? 'opacity-70 cursor-not-allowed' : ''
                }`}
              >
                {guardando ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white rounded-full border-t-transparent animate-spin"></div>
                    <span>Guardando...</span>
                  </>
                ) : (
                  <>
                    <SaveIcon />
                    <span>Guardar Cambios</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ConfiguracionEmpresa;

