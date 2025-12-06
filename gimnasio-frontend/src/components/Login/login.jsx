import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AvatarGroup from '../Avatar/avatar';
import { AlertaCredenciales, AlertaLoginExitoso } from '../Alerta/Alert';
import TextType from '../TextAnimation/TextType';

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
  const [showPassword, setShowPassword] = useState(false);
  const [usuario, setUsuario] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [errorCredenciales, setErrorCredenciales] = useState(false);
  const [loginExitoso, setLoginExitoso] = useState(false);
  const [cargando, setCargando] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setCargando(true);
    setErrorCredenciales(false);
    setLoginExitoso(false);
    
    try {
      const response = await fetch("http://localhost:4000/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ usuario: usuario, password: password }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.token && data.rol) {
          sessionStorage.setItem('token', data.token);
          sessionStorage.setItem('rol', data.rol);
          
          // Mostrar notificación de éxito
          setLoginExitoso(true);
          setCargando(false);
          
          // Esperar 2 segundos antes de navegar para que el usuario vea la notificación
          setTimeout(() => {
            if (data.rol === 'admin') {
              navigate("/panel");
            } else if (data.rol === 'trabajador') {
              navigate("/paneltrabajador");
            } else {
              // Fallback por si el rol no es ninguno de los esperados
              setErrorCredenciales(true);
              setLoginExitoso(false);
            }
          }, 2000);
        } else {
          setErrorCredenciales(true);
          setCargando(false);
        }
      } else {
        setErrorCredenciales(true);
        setCargando(false);
      }
    } catch (error) {
      alert("Error de conexión con el servidor.");
      setCargando(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen text-white bg-black lg:flex-row">
      {/* Imagen lateral - Banner en móvil, panel lateral en desktop */}
      <div className="relative w-full h-40 xs:h-48 sm:h-64 md:h-80 lg:h-auto lg:w-1/2 overflow-hidden">
        <div
          className="w-full h-full bg-center bg-cover bg-no-repeat animate-zoomImage grayscale lg:grayscale-0"
          style={{ 
            backgroundImage: "url('/images/login.png')"
          }}
        ></div>
        {/* Overlay oscuro solo en móvil para mejor contraste */}
        <div className="absolute inset-0 bg-black/40 lg:hidden"></div>
      </div>

      {/* Formulario */}
      <div className="flex items-center justify-center w-full px-3 xs:px-4 sm:px-6 py-6 xs:py-8 sm:py-10 shadow-inner bg-zinc-900 lg:w-1/2">
        <div className="w-full max-w-md space-y-3 xs:space-y-4 sm:space-y-6 animate-fadeInDown">
          <div className="text-center">
            <div className="scale-75 xs:scale-90 sm:scale-100 inline-block">
              <AvatarGroup />
            </div>
            <h1 className="text-lg xs:text-xl sm:text-2xl md:text-3xl font-extrabold tracking-wide mt-2 xs:mt-3">
              <TextType 
                text={["Gimnasio Terrones"]}
                typingSpeed={75}
                pauseDuration={3000}
                showCursor={true}
                cursorCharacter="|"
              />
            </h1>
            <p className="mt-1 text-[10px] xs:text-xs sm:text-sm text-gray-400">Accede con tus credenciales</p>
          </div>

          {errorCredenciales && (
            <div className="animate-fadeInDown">
              <AlertaCredenciales />
            </div>
          )}
          {loginExitoso && (
            <div className="animate-fadeInDown">
              <AlertaLoginExitoso />
            </div>
          )}

          <form onSubmit={handleSubmit} className={`space-y-3 xs:space-y-4 sm:space-y-5 transition-all duration-300 ${cargando ? 'opacity-75' : 'opacity-100'}`}>
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

            <div className="flex items-center justify-between text-xs xs:text-sm text-gray-400">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="mr-1.5 xs:mr-2 accent-red-600 w-3.5 h-3.5 xs:w-4 xs:h-4"
                />
                Recordarme
              </label>
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
          </form>
        </div>
      </div>
    </div>
  );
}

export default Login;
