import React, { useState, useEffect } from 'react';
import api from '../../utils/axiosInstance';
import SettingsIcon from '@mui/icons-material/Settings';
import SaveIcon from '@mui/icons-material/Save';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import DeleteIcon from '@mui/icons-material/Delete';
// eslint-disable-next-line no-unused-vars
import TableChartIcon from '@mui/icons-material/TableChart';
// eslint-disable-next-line no-unused-vars
import DashboardIcon from '@mui/icons-material/Dashboard';
// eslint-disable-next-line no-unused-vars
import RadioButtonCheckedIcon from '@mui/icons-material/RadioButtonChecked';
// eslint-disable-next-line no-unused-vars
import ViewModuleIcon from '@mui/icons-material/ViewModule';
// eslint-disable-next-line no-unused-vars
import PaletteIcon from '@mui/icons-material/Palette';

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
    colorAcentos: '#D72838'
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
          colorAcentos: empresa.colorAcentos || '#D72838'
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
          : null
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

        // Forzar re-renderizado de todos los componentes que usan los colores
        // Usar requestAnimationFrame para asegurar que se aplica después del render
        requestAnimationFrame(() => {
          aplicarColoresInmediatamente();
          
          // Notificar a otros componentes que los colores han cambiado
          window.dispatchEvent(new CustomEvent('coloresActualizados', {
            detail: { colores: colores }
          }));
          
          // Disparar evento para recargar colores desde el servidor
          window.dispatchEvent(new Event('recargarColores'));
          
          // Disparar evento para actualizar datos de la empresa (nombre, logo, etc.)
          window.dispatchEvent(new Event('datosEmpresaActualizados'));
          
          // Disparar un evento adicional para forzar actualización de componentes
          window.dispatchEvent(new Event('resize'));
        });

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
          <div className="w-16 h-16 border-4 border-color-botones border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg font-semibold">Cargando datos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full p-4 xs:p-6 sm:p-8 relative">
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
            <p className="text-sm text-gray-500 text-center">Aplicando los cambios en el sistema</p>
          </div>
        </div>
      )}

      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex items-center gap-3">
          <SettingsIcon className="text-red-600" fontSize="large" />
          <h1 className="text-2xl xs:text-3xl font-bold text-gray-800">
            Configuración de Empresa
          </h1>
        </div>

        {/* Mensajes */}
        {mensaje.texto && (
          <div
            className={`mb-6 p-4 rounded-lg ${
              mensaje.tipo === 'exito'
                ? 'bg-green-100 text-green-800 border border-green-300'
                : 'bg-red-100 text-red-800 border border-red-300'
            }`}
          >
            {mensaje.texto}
          </div>
        )}

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-lg p-6 space-y-6">
          {/* Logo de la empresa */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Logo de la Empresa
            </label>
            <div className="flex flex-col sm:flex-row gap-4 items-start">
              {/* Preview del logo */}
              <div className="relative">
                {previewLogo ? (
                  <div className="relative">
                    <img
                      src={previewLogo}
                      alt="Logo de la empresa"
                      className="w-32 h-32 xs:w-40 xs:h-40 object-contain border-2 border-gray-300 rounded-lg bg-gray-50 p-2"
                    />
                    <button
                      type="button"
                      onClick={eliminarLogo}
                      className="absolute -top-2 -right-2 bg-color-botones text-white rounded-full p-1 transition-colors"
                      title="Eliminar logo"
                    >
                      <DeleteIcon fontSize="small" />
                    </button>
                  </div>
                ) : (
                  <div className="w-32 h-32 xs:w-40 xs:h-40 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50 flex items-center justify-center">
                    <PhotoCameraIcon className="text-gray-400" fontSize="large" />
                  </div>
                )}
              </div>

              {/* Botón para subir imagen */}
              <div className="flex-1">
                <label className="inline-flex items-center px-4 py-2 bg-color-botones text-white rounded-lg cursor-pointer transition-colors">
                  <PhotoCameraIcon className="mr-2" />
                  <span>Seleccionar Imagen</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
                <p className="mt-2 text-xs text-gray-500">
                  Formatos: JPG, PNG, GIF. Tamaño máximo: 5MB
                </p>
              </div>
            </div>
          </div>

          {/* Nombre de la empresa */}
          <div>
            <label htmlFor="nombreEmpresa" className="block text-sm font-semibold text-gray-700 mb-2">
              Nombre de la Empresa *
            </label>
            <input
              type="text"
              id="nombreEmpresa"
              name="nombreEmpresa"
              value={datosEmpresa.nombreEmpresa}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-color-acentos focus:border-transparent"
              placeholder="Ej: Gimnasio Terrones"
              required
            />
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
              Email de la Empresa *
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={datosEmpresa.email}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-color-acentos focus:border-transparent"
              placeholder="empresa@gmail.com"
              required
            />
          </div>

          {/* Plantillas de colores */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-gray-800">🎨 Plantilla de Colores</h3>
            <p className="text-sm text-gray-600 mb-4">
              Selecciona una plantilla de colores predefinida para personalizar el aspecto de tu sistema
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {plantillas.map((plantilla) => (
                <div
                  key={plantilla.id}
                  onClick={() => handleSeleccionarPlantilla(plantilla.id)}
                  className={`relative p-4 border-2 rounded-lg cursor-pointer transition-all hover:shadow-lg ${
                    datosEmpresa.plantillaColor === plantilla.id
                      ? 'border-color-botones bg-color-botones bg-opacity-5'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  {/* Indicador de selección */}
                  {datosEmpresa.plantillaColor === plantilla.id && (
                    <div className="absolute top-2 right-2 w-6 h-6 bg-color-botones rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                  
                  {/* Preview de colores */}
                  <div className="mb-3">
                    <div className="flex gap-1 h-16 rounded overflow-hidden border border-gray-300 shadow-sm">
                      {/* Negro - Tablas (header) */}
                      <div className="w-1/6 bg-black flex flex-col items-center justify-center relative group">
                        <TableChartIcon className="text-white text-xs opacity-80" />
                        <span className="text-[8px] text-white opacity-70 mt-0.5 hidden group-hover:block absolute bottom-0.5 left-0 right-0 text-center">Tablas</span>
                      </div>
                      {/* Sistema (sidebar) */}
                      <div className="flex-1 flex flex-col items-center justify-center relative group" style={{ backgroundColor: plantilla.preview[0] }}>
                        <DashboardIcon className={`text-xs ${plantilla.preview[0] === '#ffffff' || plantilla.preview[0] === '#111827' ? 'text-gray-800' : 'text-white'} opacity-80`} />
                        <span className="text-[8px] mt-0.5 hidden group-hover:block absolute bottom-0.5 left-0 right-0 text-center" style={{ color: plantilla.preview[0] === '#ffffff' || plantilla.preview[0] === '#111827' ? '#1f2937' : 'white' }}>Sistema</span>
                      </div>
                      {/* Botones */}
                      <div className="flex-1 flex flex-col items-center justify-center relative group" style={{ backgroundColor: plantilla.preview[1] }}>
                        <RadioButtonCheckedIcon className={`text-xs ${plantilla.preview[1] === '#ffffff' || plantilla.preview[1] === '#111827' ? 'text-gray-800' : 'text-white'} opacity-80`} />
                        <span className="text-[8px] mt-0.5 hidden group-hover:block absolute bottom-0.5 left-0 right-0 text-center" style={{ color: plantilla.preview[1] === '#ffffff' || plantilla.preview[1] === '#111827' ? '#1f2937' : 'white' }}>Botones</span>
                      </div>
                      {/* Cards */}
                      <div className="flex-1 flex flex-col items-center justify-center relative group" style={{ backgroundColor: plantilla.preview[2] }}>
                        <ViewModuleIcon className={`text-xs ${plantilla.preview[2] === '#ffffff' || plantilla.preview[2] === '#111827' ? 'text-gray-800' : 'text-white'} opacity-80`} />
                        <span className="text-[8px] mt-0.5 hidden group-hover:block absolute bottom-0.5 left-0 right-0 text-center" style={{ color: plantilla.preview[2] === '#ffffff' || plantilla.preview[2] === '#111827' ? '#1f2937' : 'white' }}>Cards</span>
                      </div>
                      {/* Tablas */}
                      <div className="flex-1 flex flex-col items-center justify-center relative group" style={{ backgroundColor: plantilla.preview[3] }}>
                        <TableChartIcon className={`text-xs ${plantilla.preview[3] === '#ffffff' || plantilla.preview[3] === '#111827' ? 'text-gray-800' : 'text-white'} opacity-80`} />
                        <span className="text-[8px] mt-0.5 hidden group-hover:block absolute bottom-0.5 left-0 right-0 text-center" style={{ color: plantilla.preview[3] === '#ffffff' || plantilla.preview[3] === '#111827' ? '#1f2937' : 'white' }}>Tablas</span>
                      </div>
                      {/* Acentos */}
                      <div className="flex-1 flex flex-col items-center justify-center relative group" style={{ backgroundColor: plantilla.preview[4] }}>
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
                    <h4 className="font-semibold text-gray-800 mb-1">{plantilla.nombre}</h4>
                    <p className="text-xs text-gray-500">{plantilla.descripcion}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Botón de guardar */}
          <div className="flex justify-end pt-4">
            <button
              type="submit"
              disabled={guardando}
              className={`flex items-center gap-2 px-6 py-3 bg-color-botones text-white rounded-lg font-semibold transition-colors ${
                guardando ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              {guardando ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
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
        </form>

        {/* Información adicional */}
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Nota:</strong> Los cambios en el nombre y logo de la empresa se reflejarán en la pantalla de inicio de sesión. 
            El color del sistema se aplicará a los botones y elementos principales de la interfaz.
          </p>
        </div>
      </div>
    </div>
  );
}

export default ConfiguracionEmpresa;

