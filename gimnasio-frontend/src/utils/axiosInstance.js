import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:4000", // tu backend
  withCredentials: true,            // importante para que mande cookies
});

export default api;
