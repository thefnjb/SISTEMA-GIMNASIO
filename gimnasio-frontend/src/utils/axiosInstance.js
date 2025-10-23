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
    if (error.response?.status === 401) {
      // Token expirado o inválido - limpiar sessionStorage y redirigir
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('rol');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);
  
export default api;
