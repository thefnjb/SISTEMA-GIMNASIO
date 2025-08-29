import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AvatarGroup from '../Avatar/avatar';
import { AlertaCredenciales } from '../Alerta/Alert';

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:4000/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ Usuario: usuario, Contraseña: password }),
        credentials: "include" // 🔑 ahora sí guarda y envía la cookie
      });

      if (response.ok) {
        const data = await response.json();
        if (data.token) {
          localStorage.setItem('token', data.token);
          navigate("/panel");
        } else {
          setErrorCredenciales(true);
        }
      } else {
        setErrorCredenciales(true);
      }
    } catch (error) {
      alert("Error de conexión con el servidor.");
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
            <h1 className="text-3xl font-extrabold tracking-wide">ADMIN GIMNASIO</h1>
            <p className="mt-1 text-sm text-gray-400">Accede con tus credenciales</p>
          </div>

          {errorCredenciales && <AlertaCredenciales />}

          <form onSubmit={handleSubmit} className="space-y-5">
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
              className="w-full py-3 font-semibold text-white bg-red-600 rounded-lg animate-pulse hover:bg-red-700"
            >
              Iniciar Sesión
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Login;
