import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AlertaLoginExitoso } from '../Alerta/Alert';
import TextType from '../TextAnimation/TextType';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';

const Button = ({ children, className, ...props }) => (
  <button className={`btn ${className}`} {...props}>
    {children}
  </button>
);

const Input = ({ className, ...props }) => (
  <input className={`input ${className}`} {...props} />
);

function Login() {
  const navigate = useNavigate();
  
  const [usuario, setUsuario] = useState("");
  const [password, setPassword] = useState("");
  const [loginExitoso, setLoginExitoso] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [mensajeError, setMensajeError] = useState("");
  const [mensajeExito, setMensajeExito] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [mostrarRecuperar, setMostrarRecuperar] = useState(false);
  const [emailRecuperar, setEmailRecuperar] = useState("");
  const [nuevaPassword, setNuevaPassword] = useState("");
  const [confirmarPassword, setConfirmarPassword] = useState("");

  const API_URL = "http://localhost:4000/auth";

  // Login tradicional con usuario y contraseña
  const handleLogin = async (e) => {
    e.preventDefault();
    setCargando(true);
    setMensajeError("");

    try {
      const response = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ 
          usuario: usuario.trim(), 
          password: password 
        }),
      });

      const data = await response.json();

      if (response.ok && data.token) {
        sessionStorage.setItem('token', data.token);
        sessionStorage.setItem('rol', data.rol || 'admin');
        
        setLoginExitoso(true);
        setCargando(false);
        
        setTimeout(() => {
          if (data.rol === 'admin' || !data.rol) {
            navigate("/panel", { replace: true });
          } else if (data.rol === 'trabajador') {
            navigate("/PanelTrabajador", { replace: true });
          } else {
            setMensajeError('Rol de usuario no válido');
          }
        }, 1500);
      } else {
        setMensajeError(data.error || data.message || 'Credenciales inválidas');
        setCargando(false);
      }
    } catch (error) {
      setMensajeError("Error de conexión con el servidor. Por favor intenta nuevamente.");
      setCargando(false);
    }
  };

  // Recuperar contraseña con email
  const handleRecuperarPassword = async (e) => {
    e.preventDefault();
    
    // Limpiar mensajes previos
    setMensajeError("");
    setMensajeExito("");

    // Validaciones
    const emailTrimmed = emailRecuperar.trim();
    if (!emailTrimmed) {
      setMensajeError("Por favor ingresa tu email");
      return;
    }

    // Validar formato de email básico
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailTrimmed)) {
      setMensajeError("Por favor ingresa un email válido");
      return;
    }

    if (!nuevaPassword || nuevaPassword.length < 6) {
      setMensajeError("La contraseña debe tener al menos 6 caracteres");
      return;
    }

    if (nuevaPassword !== confirmarPassword) {
      setMensajeError("Las contraseñas no coinciden");
      return;
    }

    // Si pasa todas las validaciones, proceder con el cambio
    setCargando(true);

    try {
      const response = await fetch(`${API_URL}/recuperar-cambiar`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ 
          email: emailTrimmed.toLowerCase(),
          nuevaPassword: nuevaPassword
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setMensajeError("");
        setMensajeExito("Contraseña cambiada exitosamente. Ahora puedes iniciar sesión.");
        setTimeout(() => {
          setMostrarRecuperar(false);
          setEmailRecuperar("");
          setNuevaPassword("");
          setConfirmarPassword("");
          setMensajeExito("");
        }, 3000);
        setCargando(false);
      } else {
        setMensajeError(data.message || data.error || 'Error al cambiar la contraseña');
        setCargando(false);
      }
    } catch (error) {
      console.error("Error al cambiar contraseña:", error);
      setMensajeError("Error de conexión con el servidor. Por favor intenta nuevamente.");
      setCargando(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen text-white bg-black lg:flex-row">
      {!mostrarRecuperar && (
        <div className="relative w-full h-40 xs:h-48 sm:h-64 md:h-80 lg:h-screen lg:w-1/2 overflow-hidden bg-zinc-800">
          <div
            className="w-full h-full bg-center bg-cover bg-no-repeat animate-zoomImage grayscale lg:grayscale-0"
            style={{ 
              backgroundImage: "url('/images/login.png')",
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
          ></div>
          <div className="absolute inset-0 bg-black/40 lg:hidden"></div>
        </div>
      )}

      <div className={`flex items-center justify-center w-full px-3 xs:px-4 sm:px-6 py-6 xs:py-8 sm:py-10 shadow-inner bg-zinc-900 ${mostrarRecuperar ? 'lg:w-full min-h-screen' : 'lg:w-1/2'}`}>
        <div className={`w-full max-w-md animate-fadeInDown ${mostrarRecuperar ? 'space-y-3 xs:space-y-4 sm:space-y-4' : 'space-y-3 xs:space-y-4 sm:space-y-6'}`}>

          {!mostrarRecuperar ? (
            <>
              <div className="text-center">
                <div className="flex justify-center mb-4">
                  <div className="p-4 bg-red-600 rounded-full">
                    <FitnessCenterIcon sx={{ fontSize: 60, color: 'white' }} />
                  </div>
                </div>
                <h1 className="text-lg xs:text-xl sm:text-2xl md:text-3xl font-extrabold tracking-wide mt-2 xs:mt-3">
                  <TextType 
                    text={["Sistema de Gestión"]}
                    typingSpeed={75}
                    pauseDuration={3000}
                    showCursor={true}
                    cursorCharacter="|"
                  />
                </h1>
                <p className="mt-1 text-[10px] xs:text-xs sm:text-sm text-gray-400">Accede con tus credenciales</p>
              </div>

              {mensajeError && (
                <div className="animate-fadeInDown p-3 bg-red-900/50 border border-red-700 rounded-lg">
                  <p className="text-sm text-red-200">{mensajeError}</p>
                </div>
              )}

              {mensajeExito && (
                <div className="animate-fadeInDown p-3 bg-green-900/50 border border-green-700 rounded-lg">
                  <p className="text-sm text-green-200">{mensajeExito}</p>
                </div>
              )}

              {loginExitoso && (
                <div className="animate-fadeInDown">
                  <AlertaLoginExitoso />
                </div>
              )}

              <form onSubmit={handleLogin} className={`space-y-3 xs:space-y-4 sm:space-y-5 transition-all duration-300 ${cargando ? 'opacity-75' : 'opacity-100'}`}>
              <div>
                <label htmlFor="usuario" className="block mb-1.5 xs:mb-2 text-xs sm:text-sm font-semibold">
                  Usuario
                </label>
                <Input
                  id="usuario"
                  type="text"
                  value={usuario}
                  onChange={(e) => setUsuario(e.target.value)}
                  className="w-full px-3 xs:px-4 py-2 xs:py-2.5 sm:py-3 text-sm xs:text-base text-white border border-gray-600 rounded-lg bg-zinc-800 focus:ring-2 focus:ring-red-500"
                  required
                  disabled={cargando}
                />
              </div>

              <div>
                <label htmlFor="password" className="block mb-1.5 xs:mb-2 text-xs sm:text-sm font-semibold">
                  Contraseña
                </label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-3 xs:px-4 py-2 xs:py-2.5 sm:py-3 pr-10 xs:pr-12 text-sm xs:text-base text-white border border-gray-600 rounded-lg bg-zinc-800 focus:ring-2 focus:ring-red-500"
                    required
                    disabled={cargando}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute text-gray-400 transform -translate-y-1/2 right-2 xs:right-3 top-1/2 hover:text-white"
                  >
                    {showPassword ? "🙈" : "👁️"}
                  </button>
                </div>
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
                    <span className="text-xs xs:text-sm">Iniciando sesión...</span>
                  </div>
                ) : (
                  'Iniciar Sesión'
                )}
              </Button>

              <div className="text-center pt-2 space-y-2">
                <button
                  type="button"
                  onClick={() => setMostrarRecuperar(true)}
                  className="text-xs sm:text-sm text-gray-400 hover:text-red-500 hover:underline"
                >
                  ¿Olvidaste tu contraseña?
                </button>
                <p className="text-xs sm:text-sm text-gray-400">
                  ¿No tienes una cuenta?{" "}
                  <Link to="/registro" className="text-red-500 hover:opacity-80 underline font-semibold">
                    Regístrate aquí
                  </Link>
                </p>
              </div>
            </form>
            </>
          ) : (
            <>
              <div className="text-center mb-4 xs:mb-5 sm:mb-6">
                <div className="flex justify-center mb-3 xs:mb-4">
                  <div className="p-3 xs:p-4 bg-red-600 rounded-full">
                    <FitnessCenterIcon sx={{ fontSize: { xs: 40, sm: 50, md: 60 }, color: 'white' }} />
                  </div>
                </div>
                <h2 className="text-xl xs:text-2xl sm:text-3xl font-bold">Recuperar Contraseña</h2>
                <p className="text-xs xs:text-sm text-gray-400 mt-2">
                  Ingresa tu email y tu nueva contraseña
                </p>
              </div>

              {mensajeError && (
                <div className="animate-fadeInDown p-3 bg-red-900/50 border border-red-700 rounded-lg">
                  <p className="text-sm text-red-200">{mensajeError}</p>
                </div>
              )}

              {mensajeExito && (
                <div className="animate-fadeInDown p-3 bg-green-900/50 border border-green-700 rounded-lg">
                  <p className="text-sm text-green-200">{mensajeExito}</p>
                </div>
              )}

              <form onSubmit={handleRecuperarPassword} noValidate className={`space-y-3 xs:space-y-4 sm:space-y-4 transition-all duration-300 ${cargando ? 'opacity-75' : 'opacity-100'}`}>

              <div>
                <label htmlFor="emailRecuperar" className="block mb-1.5 xs:mb-2 text-xs sm:text-sm font-semibold">
                  Email
                </label>
                <Input
                  id="emailRecuperar"
                  type="email"
                  value={emailRecuperar}
                  onChange={(e) => {
                    setEmailRecuperar(e.target.value);
                    setMensajeError(""); // Limpiar error al escribir
                  }}
                  className="w-full px-3 xs:px-4 py-2 xs:py-2.5 sm:py-3 text-sm xs:text-base text-white border border-gray-600 rounded-lg bg-zinc-800 focus:ring-2 focus:ring-red-500"
                  placeholder="ejemplo@correo.com"
                  disabled={cargando}
                  autoComplete="email"
                />
              </div>

              <div>
                <label htmlFor="nuevaPassword" className="block mb-1.5 xs:mb-2 text-xs sm:text-sm font-semibold">
                  Nueva Contraseña
                </label>
                <Input
                  id="nuevaPassword"
                  type="password"
                  value={nuevaPassword}
                  onChange={(e) => {
                    setNuevaPassword(e.target.value);
                    setMensajeError(""); // Limpiar error al escribir
                  }}
                  className="w-full px-3 xs:px-4 py-2 xs:py-2.5 sm:py-3 text-sm xs:text-base text-white border border-gray-600 rounded-lg bg-zinc-800 focus:ring-2 focus:ring-red-500"
                  placeholder="Mínimo 6 caracteres"
                  disabled={cargando}
                  autoComplete="new-password"
                  minLength={6}
                />
              </div>

              <div>
                <label htmlFor="confirmarPassword" className="block mb-1.5 xs:mb-2 text-xs sm:text-sm font-semibold">
                  Confirmar Contraseña
                </label>
                <Input
                  id="confirmarPassword"
                  type="password"
                  value={confirmarPassword}
                  onChange={(e) => {
                    setConfirmarPassword(e.target.value);
                    setMensajeError(""); // Limpiar error al escribir
                  }}
                  className="w-full px-3 xs:px-4 py-2 xs:py-2.5 sm:py-3 text-sm xs:text-base text-white border border-gray-600 rounded-lg bg-zinc-800 focus:ring-2 focus:ring-red-500"
                  placeholder="Repite la contraseña"
                  disabled={cargando}
                  autoComplete="new-password"
                  minLength={6}
                />
              </div>

              <Button
                type="submit"
                disabled={cargando || !emailRecuperar.trim() || !nuevaPassword || !confirmarPassword}
                className={`w-full py-2.5 xs:py-3 text-sm xs:text-base font-semibold text-white rounded-lg transition-all duration-300 ${
                  cargando || !emailRecuperar.trim() || !nuevaPassword || !confirmarPassword
                    ? 'bg-gray-600 cursor-not-allowed opacity-70' 
                    : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                {cargando ? (
                  <div className="flex items-center justify-center">
                    <div className="w-4 h-4 xs:w-5 xs:h-5 mr-2 border-2 border-white rounded-full border-t-transparent animate-spin"></div>
                    <span>Cambiando...</span>
                  </div>
                ) : (
                  "Cambiar Contraseña"
                )}
              </Button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => {
                    setMostrarRecuperar(false);
                    setEmailRecuperar("");
                    setNuevaPassword("");
                    setConfirmarPassword("");
                    setMensajeError("");
                    setMensajeExito("");
                  }}
                  className="text-xs xs:text-sm text-gray-400 hover:text-red-500 hover:underline"
                >
                  Volver al inicio de sesión
                </button>
              </div>
            </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default Login;
