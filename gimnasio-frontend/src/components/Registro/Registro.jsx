import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AvatarGroup from '../Avatar/avatar';
import TextType from '../TextAnimation/TextType';
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
import axios from 'axios';

const Button = ({ children, className, ...props }) => (
  <button className={`btn ${className}`} {...props}>
    {children}
  </button>
);

const Input = ({ className, ...props }) => (
  <input className={`input ${className}`} {...props} />
);

function Registro() {
  const [cargando, setCargando] = useState(false);
  const [mensajeError, setMensajeError] = useState("");
  const [mensajeExito, setMensajeExito] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [previewLogo, setPreviewLogo] = useState(null);
  const [credenciales, setCredenciales] = useState(null); // Para almacenar las credenciales
  
  const [datosRegistro, setDatosRegistro] = useState({
    usuario: "",
    password: "",
    confirmPassword: "",
    nombreEmpresa: "",
    email: "",
    logoEmpresa: null,
    plantillaColor: "porDefecto"
  });
  const [plantillas, setPlantillas] = useState([]);

  const API_URL = "http://localhost:4000/gym";

  // Cargar plantillas al montar
  useEffect(() => {
    cargarPlantillas();
  }, []);

  const cargarPlantillas = async () => {
    try {
      const response = await axios.get(`${API_URL}/plantillas-colores`);
      if (response.data.success) {
        setPlantillas(response.data.plantillas);
      }
    } catch (error) {
      console.error('Error al cargar plantillas:', error);
    }
  };

  const handleSeleccionarPlantilla = (plantillaId) => {
    setDatosRegistro(prev => ({
      ...prev,
      plantillaColor: plantillaId
    }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setDatosRegistro(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validar tipo de archivo
      if (!file.type.startsWith('image/')) {
        setMensajeError('Por favor selecciona un archivo de imagen válido');
        return;
      }

      // Validar tamaño (máximo 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setMensajeError('La imagen no debe superar los 5MB');
        return;
      }

      // Crear preview y convertir a base64
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewLogo(reader.result);
        setDatosRegistro(prev => ({
          ...prev,
          logoEmpresa: reader.result // data URL
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const eliminarLogo = () => {
    setPreviewLogo(null);
    setDatosRegistro(prev => ({
      ...prev,
      logoEmpresa: null
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setCargando(true);
    setMensajeError("");
    setMensajeExito("");

    // Validaciones
    if (!datosRegistro.usuario.trim()) {
      setMensajeError("El usuario es requerido");
      setCargando(false);
      return;
    }

    if (!datosRegistro.password.trim()) {
      setMensajeError("La contraseña es requerida");
      setCargando(false);
      return;
    }

    if (datosRegistro.password.length < 6) {
      setMensajeError("La contraseña debe tener al menos 6 caracteres");
      setCargando(false);
      return;
    }

    if (datosRegistro.password !== datosRegistro.confirmPassword) {
      setMensajeError("Las contraseñas no coinciden");
      setCargando(false);
      return;
    }

    if (!datosRegistro.nombreEmpresa.trim()) {
      setMensajeError("El nombre de la empresa es requerido");
      setCargando(false);
      return;
    }

    if (!datosRegistro.email.trim()) {
      setMensajeError("El email es requerido");
      setCargando(false);
      return;
    }

    // Validar formato de email
    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(datosRegistro.email)) {
      setMensajeError("Por favor ingresa un email válido");
      setCargando(false);
      return;
    }

    try {
      const response = await fetch(`${API_URL}/registraradmin`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          usuario: datosRegistro.usuario.trim(),
          password: datosRegistro.password,
          nombreEmpresa: datosRegistro.nombreEmpresa.trim(),
          email: datosRegistro.email.trim().toLowerCase(),
          logoEmpresa: datosRegistro.logoEmpresa || null,
          plantillaColor: datosRegistro.plantillaColor
        }),
      });

      const data = await response.json();

      console.log('Respuesta del servidor:', data);
      console.log('Status:', response.status);

      if (response.ok && data.success) {
        console.log('✅ Usuario registrado exitosamente:', data.gym);
        // Guardar credenciales para mostrar
        if (data.credenciales) {
          setCredenciales(data.credenciales);
        }
        setMensajeExito("¡Cuenta creada exitosamente!");
        setCargando(false);
      } else {
        const errorMsg = data.error || "Error al crear la cuenta. Por favor intenta nuevamente.";
        console.error('❌ Error al registrar:', errorMsg);
        console.error('Detalles:', data);
        setMensajeError(errorMsg);
        setCargando(false);
      }
    } catch (error) {
      console.error("❌ Error de conexión al registrar:", error);
      setMensajeError("Error de conexión con el servidor. Por favor verifica tu conexión e intenta nuevamente.");
      setCargando(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen text-white bg-black lg:flex-row">
      {/* Imagen lateral */}
      <div className="relative w-full h-40 xs:h-48 sm:h-64 md:h-80 lg:h-auto lg:w-1/2 overflow-hidden">
        <div
          className="w-full h-full bg-center bg-cover bg-no-repeat animate-zoomImage grayscale lg:grayscale-0"
          style={{ 
            backgroundImage: "url('/images/login.png')"
          }}
        ></div>
        <div className="absolute inset-0 bg-black/40 lg:hidden"></div>
      </div>

      {/* Formulario */}
      <div className="flex items-center justify-center w-full px-3 xs:px-4 sm:px-6 py-6 xs:py-8 sm:py-10 shadow-inner bg-zinc-900 lg:w-1/2 overflow-y-auto">
        <div className="w-full max-w-md space-y-3 xs:space-y-4 sm:space-y-6 animate-fadeInDown">
          <div className="text-center">
            <div className="scale-75 xs:scale-90 sm:scale-100 inline-block">
              {previewLogo ? (
                <div className="flex justify-center mb-4">
                  <img
                    src={previewLogo}
                    alt="Logo de la empresa"
                    className="w-20 h-20 rounded-full object-cover border-4 border-gray-600 shadow-lg"
                  />
                </div>
              ) : (
                <AvatarGroup />
              )}
            </div>
            <h1 className="text-lg xs:text-xl sm:text-2xl md:text-3xl font-extrabold tracking-wide mt-2 xs:mt-3">
              <TextType 
                text={["Crear Cuenta"]}
                typingSpeed={75}
                pauseDuration={3000}
                showCursor={true}
                cursorCharacter="|"
              />
            </h1>
            <p className="mt-1 text-[10px] xs:text-xs sm:text-sm text-gray-400">
              Registra tu gimnasio para comenzar
            </p>
          </div>

          {/* Mensajes de error */}
          {mensajeError && (
            <div className="animate-fadeInDown p-3 bg-red-900/50 border border-red-700 rounded-lg">
              <p className="text-sm text-red-200">{mensajeError}</p>
            </div>
          )}

          {/* Mensajes de éxito */}
          {mensajeExito && (
            <div className="animate-fadeInDown p-3 bg-green-900/50 border border-green-700 rounded-lg">
              <p className="text-sm text-green-200">{mensajeExito}</p>
            </div>
          )}

          {/* Notificación con credenciales */}
          {credenciales ? (
            <div className="animate-fadeInDown p-4 bg-blue-900/50 border-2 border-blue-500 rounded-lg">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3 flex-1">
                  <h3 className="text-sm font-bold text-blue-200 mb-2">
                    ⚠️ Guarda estas credenciales
                  </h3>
                  <div className="bg-black/30 p-3 rounded border border-blue-600/50 mb-3">
                    <p className="text-xs text-gray-300 mb-1">Usuario:</p>
                    <p className="text-sm font-mono font-bold text-white mb-3">{credenciales.usuario}</p>
                    <p className="text-xs text-gray-300 mb-1">Contraseña:</p>
                    <p className="text-sm font-mono font-bold text-white">{credenciales.password}</p>
                  </div>
                  <p className="text-xs text-blue-300 mb-3">
                    Estas son tus credenciales de administrador. Guárdalas en un lugar seguro.
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        const texto = `Usuario: ${credenciales.usuario}\nContraseña: ${credenciales.password}`;
                        navigator.clipboard.writeText(texto);
                        alert('Credenciales copiadas al portapapeles');
                      }}
                      className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded transition-colors"
                    >
                      Copiar
                    </button>
                    <Link
                      to="/"
                      className="flex-1 px-3 py-2 bg-green-600 hover:bg-green-700 text-white text-xs font-semibold rounded text-center transition-colors"
                    >
                      Ir a Login
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className={`space-y-3 xs:space-y-4 sm:space-y-5 transition-all duration-300 ${cargando ? 'opacity-75' : 'opacity-100'}`}>
            {/* Logo de la empresa */}
            <div>
              <label className="block mb-2 text-xs sm:text-sm font-semibold">
                Logo de la Empresa (Opcional)
              </label>
              <div className="flex flex-col sm:flex-row gap-4 items-start">
                {/* Preview del logo */}
                <div className="relative">
                  {previewLogo ? (
                    <div className="relative">
                      <img
                        src={previewLogo}
                        alt="Logo preview"
                        className="w-24 h-24 xs:w-32 xs:h-32 object-contain border-2 border-gray-600 rounded-lg bg-zinc-800 p-2"
                      />
                      <button
                        type="button"
                        onClick={eliminarLogo}
                        className="absolute -top-2 -right-2 bg-red-600 hover:bg-red-700 text-white rounded-full p-1 transition-colors"
                        title="Eliminar logo"
                      >
                        <DeleteIcon fontSize="small" />
                      </button>
                    </div>
                  ) : (
                    <div className="w-24 h-24 xs:w-32 xs:h-32 border-2 border-dashed border-gray-600 rounded-lg bg-zinc-800 flex items-center justify-center">
                      <PhotoCameraIcon className="text-gray-400" fontSize="large" />
                    </div>
                  )}
                </div>

                {/* Botón para subir imagen */}
                <div className="flex-1">
                  <label className="inline-flex items-center px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg cursor-pointer transition-colors">
                    <PhotoCameraIcon className="mr-2" fontSize="small" />
                    <span className="text-xs sm:text-sm">Seleccionar Imagen</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                      disabled={cargando}
                    />
                  </label>
                  <p className="mt-2 text-xs text-gray-400">
                    Formatos: JPG, PNG, GIF. Máx: 5MB
                  </p>
                </div>
              </div>
            </div>

            {/* Nombre de la empresa */}
            <div>
              <label htmlFor="nombreEmpresa" className="block mb-1.5 xs:mb-2 text-xs sm:text-sm font-semibold">
                Nombre de la Empresa *
              </label>
              <Input
                id="nombreEmpresa"
                name="nombreEmpresa"
                type="text"
                value={datosRegistro.nombreEmpresa}
                onChange={handleInputChange}
                className="w-full px-3 xs:px-4 py-2 xs:py-2.5 sm:py-3 text-sm xs:text-base text-white border border-gray-600 rounded-lg bg-zinc-800 focus:ring-2 focus:ring-red-500"
                placeholder="Ej: Gimnasio Terrones"
                required
                disabled={cargando}
              />
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block mb-1.5 xs:mb-2 text-xs sm:text-sm font-semibold">
                Email de la Empresa *
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                value={datosRegistro.email}
                onChange={handleInputChange}
                className="w-full px-3 xs:px-4 py-2 xs:py-2.5 sm:py-3 text-sm xs:text-base text-white border border-gray-600 rounded-lg bg-zinc-800 focus:ring-2 focus:ring-red-500"
                placeholder="empresa@gmail.com"
                required
                disabled={cargando}
              />
              <p className="mt-1 text-xs text-gray-400">
                Este email recibirá los códigos de verificación
              </p>
            </div>

            {/* Usuario */}
            <div>
              <label htmlFor="usuario" className="block mb-1.5 xs:mb-2 text-xs sm:text-sm font-semibold">
                Usuario *
              </label>
              <Input
                id="usuario"
                name="usuario"
                type="text"
                value={datosRegistro.usuario}
                onChange={handleInputChange}
                className="w-full px-3 xs:px-4 py-2 xs:py-2.5 sm:py-3 text-sm xs:text-base text-white border border-gray-600 rounded-lg bg-zinc-800 focus:ring-2 focus:ring-red-500"
                placeholder="nombreusuario"
                required
                disabled={cargando}
              />
            </div>

            {/* Contraseña */}
            <div>
              <label htmlFor="password" className="block mb-1.5 xs:mb-2 text-xs sm:text-sm font-semibold">
                Contraseña *
              </label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={datosRegistro.password}
                  onChange={handleInputChange}
                  className="w-full px-3 xs:px-4 py-2 xs:py-2.5 sm:py-3 pr-10 xs:pr-12 text-sm xs:text-base text-white border border-gray-600 rounded-lg bg-zinc-800 focus:ring-2 focus:ring-red-500"
                  placeholder="Mínimo 6 caracteres"
                  required
                  disabled={cargando}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute text-gray-400 transform -translate-y-1/2 right-2 xs:right-3 top-1/2 hover:text-white text-sm xs:text-base"
                >
                  {showPassword ? "🙈" : "👁️"}
                </button>
              </div>
            </div>

            {/* Confirmar Contraseña */}
            <div>
              <label htmlFor="confirmPassword" className="block mb-1.5 xs:mb-2 text-xs sm:text-sm font-semibold">
                Confirmar Contraseña *
              </label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={datosRegistro.confirmPassword}
                  onChange={handleInputChange}
                  className="w-full px-3 xs:px-4 py-2 xs:py-2.5 sm:py-3 pr-10 xs:pr-12 text-sm xs:text-base text-white border border-gray-600 rounded-lg bg-zinc-800 focus:ring-2 focus:ring-red-500"
                  placeholder="Repite la contraseña"
                  required
                  disabled={cargando}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute text-gray-400 transform -translate-y-1/2 right-2 xs:right-3 top-1/2 hover:text-white text-sm xs:text-base"
                >
                  {showConfirmPassword ? "🙈" : "👁️"}
                </button>
              </div>
            </div>

            {/* Sección de Plantillas de Colores */}
            <div className="pt-4 border-t border-gray-700">
              <h3 className="text-sm sm:text-base font-bold mb-2 text-gray-300">
                🎨 Plantilla de Colores
              </h3>
              <p className="text-xs text-gray-400 mb-4">
                Selecciona una plantilla de colores para personalizar tu sistema
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {plantillas.map((plantilla) => (
                  <div
                    key={plantilla.id}
                    onClick={() => handleSeleccionarPlantilla(plantilla.id)}
                    className={`relative p-3 border-2 rounded-lg cursor-pointer transition-all hover:shadow-lg ${
                      datosRegistro.plantillaColor === plantilla.id
                        ? 'border-red-500 bg-red-500 bg-opacity-10'
                        : 'border-gray-600 hover:border-gray-500'
                    }`}
                  >
                    {/* Indicador de selección */}
                    {datosRegistro.plantillaColor === plantilla.id && (
                      <div className="absolute top-1 right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    )}
                    
                    {/* Preview de colores */}
                    <div className="mb-2">
                      <div className="flex gap-0.5 h-10 rounded overflow-hidden border border-gray-600 shadow-sm">
                        {/* Negro - Tablas (header) */}
                        <div className="w-1/6 bg-black flex flex-col items-center justify-center relative group">
                          <TableChartIcon className="text-white text-[10px] opacity-80" />
                          <span className="text-[7px] text-white opacity-70 mt-0.5 hidden group-hover:block absolute bottom-0 left-0 right-0 text-center">Tablas</span>
                        </div>
                        {/* Sistema (sidebar) */}
                        <div className="flex-1 flex flex-col items-center justify-center relative group" style={{ backgroundColor: plantilla.preview[0] }}>
                          <DashboardIcon className={`text-[10px] ${plantilla.preview[0] === '#ffffff' || plantilla.preview[0] === '#111827' ? 'text-gray-800' : 'text-white'} opacity-80`} />
                          <span className="text-[7px] mt-0.5 hidden group-hover:block absolute bottom-0 left-0 right-0 text-center" style={{ color: plantilla.preview[0] === '#ffffff' || plantilla.preview[0] === '#111827' ? '#1f2937' : 'white' }}>Sistema</span>
                        </div>
                        {/* Botones */}
                        <div className="flex-1 flex flex-col items-center justify-center relative group" style={{ backgroundColor: plantilla.preview[1] }}>
                          <RadioButtonCheckedIcon className={`text-[10px] ${plantilla.preview[1] === '#ffffff' || plantilla.preview[1] === '#111827' ? 'text-gray-800' : 'text-white'} opacity-80`} />
                          <span className="text-[7px] mt-0.5 hidden group-hover:block absolute bottom-0 left-0 right-0 text-center" style={{ color: plantilla.preview[1] === '#ffffff' || plantilla.preview[1] === '#111827' ? '#1f2937' : 'white' }}>Botones</span>
                        </div>
                        {/* Cards */}
                        <div className="flex-1 flex flex-col items-center justify-center relative group" style={{ backgroundColor: plantilla.preview[2] }}>
                          <ViewModuleIcon className={`text-[10px] ${plantilla.preview[2] === '#ffffff' || plantilla.preview[2] === '#111827' ? 'text-gray-800' : 'text-white'} opacity-80`} />
                          <span className="text-[7px] mt-0.5 hidden group-hover:block absolute bottom-0 left-0 right-0 text-center" style={{ color: plantilla.preview[2] === '#ffffff' || plantilla.preview[2] === '#111827' ? '#1f2937' : 'white' }}>Cards</span>
                        </div>
                        {/* Tablas */}
                        <div className="flex-1 flex flex-col items-center justify-center relative group" style={{ backgroundColor: plantilla.preview[3] }}>
                          <TableChartIcon className={`text-[10px] ${plantilla.preview[3] === '#ffffff' || plantilla.preview[3] === '#111827' ? 'text-gray-800' : 'text-white'} opacity-80`} />
                          <span className="text-[7px] mt-0.5 hidden group-hover:block absolute bottom-0 left-0 right-0 text-center" style={{ color: plantilla.preview[3] === '#ffffff' || plantilla.preview[3] === '#111827' ? '#1f2937' : 'white' }}>Tablas</span>
                        </div>
                        {/* Acentos */}
                        <div className="flex-1 flex flex-col items-center justify-center relative group" style={{ backgroundColor: plantilla.preview[4] }}>
                          <PaletteIcon className={`text-[10px] ${plantilla.preview[4] === '#ffffff' || plantilla.preview[4] === '#111827' ? 'text-gray-800' : 'text-white'} opacity-80`} />
                          <span className="text-[7px] mt-0.5 hidden group-hover:block absolute bottom-0 left-0 right-0 text-center" style={{ color: plantilla.preview[4] === '#ffffff' || plantilla.preview[4] === '#111827' ? '#1f2937' : 'white' }}>Acentos</span>
                        </div>
                      </div>
                      {/* Leyenda debajo del preview */}
                      <div className="mt-0.5 text-[8px] text-gray-400 text-center">
                        Pasa el mouse para ver detalles
                      </div>
                    </div>
                    
                    {/* Información de la plantilla */}
                    <div>
                      <h4 className="font-semibold text-xs text-gray-300 mb-0.5">{plantilla.nombre}</h4>
                      <p className="text-xs text-gray-500 line-clamp-1">{plantilla.descripcion}</p>
                    </div>
                  </div>
                ))}
              </div>
              <p className="mt-2 text-xs text-gray-400">
                Puedes cambiar la plantilla después en Configuración.
              </p>
            </div>

            <Button
              type="submit"
              disabled={cargando}
              className={`w-full py-2.5 xs:py-3 text-sm xs:text-base font-semibold text-white rounded-lg transition-all duration-300 ${
                cargando 
                  ? 'bg-gray-600 cursor-not-allowed opacity-70' 
                  : 'bg-red-600 hover:bg-red-700 animate-pulse'
              }`}
            >
              {cargando ? (
                <div className="flex items-center justify-center">
                  <div className="w-4 h-4 xs:w-5 xs:h-5 mr-2 border-2 border-white rounded-full border-t-transparent animate-spin"></div>
                  <span className="text-xs xs:text-sm">Creando cuenta...</span>
                </div>
              ) : (
                'Crear Cuenta'
              )}
            </Button>

            {/* Link para ir al login */}
            <div className="text-center pt-2">
              <p className="text-xs sm:text-sm text-gray-400">
                ¿Ya tienes una cuenta?{' '}
                <Link to="/" className="text-color-acentos hover:opacity-80 underline font-semibold">
                  Inicia sesión aquí
                </Link>
              </p>
            </div>
          </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default Registro;

