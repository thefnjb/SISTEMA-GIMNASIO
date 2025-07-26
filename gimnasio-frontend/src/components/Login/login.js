import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AvatarGroup from '../Avatar/avatar';
import { AlertaCredenciales } from '../Alerta/Alerct';

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
  const [usuario, setUsuario] = useState(""); // Vacío al iniciar
  const [password, setPassword] = useState(""); // Vacío al iniciar
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
        body: JSON.stringify({ Usuario: usuario, Contraseña: password })
      });
      if (response.ok) {
        navigate('/panel');
      } else {
        setErrorCredenciales(true);
      }
    } catch (error) {
      alert("Error de conexión con el servidor.");
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-black text-white lg:flex-row">
      {/* Imagen lateral con efecto dramático */}
      <div className="relative hidden overflow-hidden lg:block lg:w-1/2">
        <div className="animate-zoomImage h-full w-full bg-cover bg-center grayscale"
          style={{ backgroundImage: "url('/images/login.png')" }}></div>
      </div>
      {/* Formulario */}
      <div className="flex w-full items-center justify-center bg-zinc-900 px-6 py-10 shadow-inner lg:w-1/2">
        <div className="animate-fadeInDown w-full max-w-md space-y-6">
          <div className="text-center">
              <AvatarGroup />
            <h1 className="text-3xl font-extrabold tracking-wide">ADMIN GIMNASIO</h1>
            <p className="mt-1 text-sm text-gray-400">Accede con tus credenciales</p>
          </div>
          {errorCredenciales && <AlertaCredenciales/>}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="usuario" className="mb-2 block text-sm font-semibold">Usuario</label>
              <Input
                id="usuario"
                type="text"
                value={usuario}
                onChange={(e) => setUsuario(e.target.value)}
                className="w-full rounded-lg border border-gray-600 bg-zinc-800 px-4 py-3 text-white focus:ring-2 focus:ring-red-500"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="mb-2 block text-sm font-semibold">Contraseña</label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-lg border border-gray-600 bg-zinc-800 px-4 py-3 pr-12 text-white focus:ring-2 focus:ring-red-500"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 transform text-gray-400 hover:text-white"
                >
                  {showPassword ? '🙈' : '👁️'}
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
              className="w-full animate-pulse rounded-lg bg-red-600 py-3 font-semibold text-white hover:bg-red-700"
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
