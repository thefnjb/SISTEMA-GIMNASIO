import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AvatarGroup from '../Avatar/avatar';

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

  const handleSubmit = (e) => {
    e.preventDefault();
    if (usuario === "admin" && password === "123") {
      navigate('/panel');
    } else {
      alert("Credenciales incorrectas.");
    }
  };

  return (
    <div className="min-h-screen flex lg:flex-row flex-col bg-black text-white">
      {/* Imagen lateral con efecto dramático */}
      <div className="hidden lg:block lg:w-1/2 relative overflow-hidden">
        <div className="w-full h-full bg-cover bg-center grayscale animate-zoomImage"
          style={{ backgroundImage: "url('/images/login.png')" }}></div>
      </div>
      {/* Formulario */}
      <div className="w-full lg:w-1/2 flex justify-center items-center px-6 py-10 bg-zinc-900 shadow-inner">
        <div className="w-full max-w-md space-y-6 animate-fadeInDown">
          <div className="text-center">
              <AvatarGroup />
            <h1 className="text-3xl font-extrabold tracking-wide">ADMIN GIMNASIO</h1>
            <p className="text-sm text-gray-400 mt-1">Accede con tus credenciales</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="usuario" className="block mb-2 text-sm font-semibold">Usuario</label>
              <Input
                id="usuario"
                type="text"
                value={usuario}
                onChange={(e) => setUsuario(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-zinc-800 text-white border border-gray-600 focus:ring-2 focus:ring-red-500"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block mb-2 text-sm font-semibold">Contraseña</label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 pr-12 rounded-lg bg-zinc-800 text-white border border-gray-600 focus:ring-2 focus:ring-red-500"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
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
                  className="accent-red-600 mr-2"
                />
                Recordarme
              </label>
            </div>

            <Button
              type="submit"
              className="w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg font-semibold animate-pulse"
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
