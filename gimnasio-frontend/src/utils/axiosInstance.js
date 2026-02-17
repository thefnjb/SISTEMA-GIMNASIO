import axios from "axios";


const api = axios.create({
  baseURL: "http://localhost:4000",             
});

api.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem("token");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor de respuesta para manejar errores de autenticación
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Solo cerrar sesión si es un error de autenticación real (token inválido/expirado)
    // No cerrar sesión para errores 401 que sean de validación de datos
    if (error.response?.status === 401) {
      const errorMessage = error.response?.data?.message || error.response?.data?.error || '';
      
      // Solo cerrar sesión si el mensaje indica que es un problema de token
      if (
        errorMessage.includes('Token') || 
        errorMessage.includes('token') ||
        errorMessage.includes('expirado') ||
        errorMessage.includes('inválido') ||
        errorMessage.includes('no proporcionado') ||
        errorMessage.includes('Acceso denegado')
      ) {
        // Token expirado o inválido - limpiar sessionStorage y redirigir
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('rol');
        window.location.href = '/';
      }
      // Si es otro tipo de error 401 (como validación), no cerrar sesión
    }
    return Promise.reject(error);
  }
);
  
export default api;
