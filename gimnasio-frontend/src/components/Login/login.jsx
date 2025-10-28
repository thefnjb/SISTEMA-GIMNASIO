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
        body: JSON.stringify({ Usuario: usuario, Contraseña: password }),
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
      {/* Imagen lateral */}
      <div className="relative hidden overflow-hidden lg:block lg:w-1/2">
        <div
          className="w-full h-full bg-center bg-cover animate-zoomImage grayscale"
          style={{ backgroundImage: "url('/images/login.png')" }}
        ></div>
      </div>

      {/* Formulario */}
      <div className="flex items-center justify-center w-full px-6 py-10 shadow-inner bg-zinc-900 lg:w-1/2">
        <div className="w-full max-w-md space-y-6 animate-fadeInDown">
          <div className="text-center">
            <AvatarGroup />
            <h1 className="text-3xl font-extrabold tracking-wide">
              <TextType 
                text={["Gimnasio Terrones"]}
                typingSpeed={75}
                pauseDuration={3000}
                showCursor={true}
                cursorCharacter="|"
              />
            </h1>
            <p className="mt-1 text-sm text-gray-400">Accede con tus credenciales</p>
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

          <form onSubmit={handleSubmit} className={`space-y-5 transition-all duration-300 ${cargando ? 'opacity-75' : 'opacity-100'}`}>
            <div>
              <label htmlFor="usuario" className="block mb-2 text-sm font-semibold">
                Usuario
              </label>
              <Input
                id="usuario"
                type="text"
                value={usuario}
                onChange={(e) => setUsuario(e.target.value)}
                className="w-full px-4 py-3 text-white border border-gray-600 rounded-lg bg-zinc-800 focus:ring-2 focus:ring-red-500"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block mb-2 text-sm font-semibold">
                Contraseña
              </label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 pr-12 text-white border border-gray-600 rounded-lg bg-zinc-800 focus:ring-2 focus:ring-red-500"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute text-gray-400 transform -translate-y-1/2 right-3 top-1/2 hover:text-white"
                >
                  {showPassword ? "🙈" : "👁️"}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm text-gray-400">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="mr-2 accent-red-600"
                />
                Recordarme
              </label>
            </div>

            <Button
              type="submit"
              disabled={cargando}
              className={`w-full py-3 font-semibold text-white rounded-lg transition-all duration-300 ${
                cargando 
                  ? 'bg-gray-600 cursor-not-allowed opacity-70' 
                  : 'bg-red-600 hover:bg-red-700 animate-pulse'
              }`}
            >
              {cargando ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 mr-2 border-2 border-white rounded-full border-t-transparent animate-spin"></div>
                  Iniciando sesión...
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
