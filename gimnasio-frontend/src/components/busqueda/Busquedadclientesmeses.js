// src/components/Busquedadclientesmeses.js
import React, { useState, useEffect } from "react";
import axios from "axios";

const Busquedadclientesmeses = () => {
  const [query, setQuery] = useState("");
  const [clientes, setClientes] = useState([]);
  const [resultados, setResultados] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ✅ Cargar todos los clientes al iniciar
  useEffect(() => {
    obtenerTodosLosClientes();
  }, []);

  // ✅ Obtener todos los clientes
  const obtenerTodosLosClientes = async () => {
  try {
    setLoading(true);
    setError("");

    const res = await axios.get("http://localhost:4000/members/miembros", {
      withCredentials: true,
    });

    const miembros = res.data.miembros || res.data;

    setClientes(miembros);
    setResultados(miembros);
  } catch (error) {
    console.error("❌ Error al obtener los clientes:", error.response?.data || error.message);
    setError("Error al cargar los clientes: " + (error.response?.data?.error || error.message));
  } finally {
    setLoading(false);
  }
};


  // ✅ Filtrar al hacer clic en buscar
  const buscarClientes = () => {
    if (!query.trim()) {
      setResultados(clientes);
      return;
    }

    const filtrados = clientes.filter((cliente) =>
      cliente.nombre.toLowerCase().includes(query.toLowerCase()) ||
      cliente.celular.includes(query)
    );
    setResultados(filtrados);
  };

  // ✅ Filtrar mientras se escribe
  const buscarEnTiempoReal = (e) => {
    const valor = e.target.value;
    setQuery(valor);

    if (!valor.trim()) {
      setResultados(clientes);
      return;
    }

    const filtrados = clientes.filter((cliente) =>
      cliente.nombre.toLowerCase().includes(valor.toLowerCase()) ||
      cliente.celular.includes(valor)
    );
    setResultados(filtrados);
  };

  // ✅ Formatear fechas
  const formatearFecha = (fecha) => {
    if (!fecha) return "No disponible";
    return new Date(fecha).toLocaleDateString("es-ES");
  };

  // ✅ Estado de pago con color
  const obtenerEstadoPago = (estadoPago) => {
    const estados = {
      'Pagado': { texto: 'Pagado', color: 'text-green-600' },
      'Pendiente': { texto: 'Pendiente', color: 'text-yellow-600' },
      'Vencido': { texto: 'Vencido', color: 'text-red-600' }
    };
    return estados[estadoPago] || { texto: estadoPago || 'No definido', color: 'text-gray-600' };
  };

  return (
    <div className="mt-10 p-4 bg-white shadow rounded-xl">
      <h2 className="text-lg font-semibold mb-4">Buscar Miembros Suscritos</h2>

      {/* Barra de búsqueda */}
      <div className="flex gap-4 mb-6">
        <input
          type="text"
          placeholder="Buscar por nombre o celular"
          className="p-2 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-red-500"
          value={query}
          onChange={buscarEnTiempoReal}
        />
        <button
          onClick={buscarClientes}
          className="bg-red-800 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
        >
          Buscar
        </button>
      </div>

      {loading && (
        <div className="text-center py-4">
          <p className="text-gray-600">Cargando miembros...</p>
        </div>
      )}

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {!loading && !error && (
        <div className="mb-4">
          <p className="text-gray-600">
            Mostrando {resultados.length} de {clientes.length} miembros
          </p>
        </div>
      )}

      {/* Lista de miembros */}
      <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
        {!loading && !error && resultados.length > 0 ? (
          resultados.map((cliente) => (
            <div
              key={cliente._id}
              className="p-4 border border-gray-200 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <p><strong>Nombre:</strong> {cliente.nombre}</p>
                  <p><strong>Celular:</strong> {cliente.celular}</p>
                  <p>
                    <strong>Estado de Pago:</strong>
                    <span className={`ml-2 ${obtenerEstadoPago(cliente.estadoPago).color}`}>
                      {obtenerEstadoPago(cliente.estadoPago).texto}
                    </span>
                  </p>
                </div>
                <div>
                  <p><strong>Estado:</strong> {cliente.estado || "Activo"}</p>
                  <p><strong>Método de Pago:</strong> {cliente.metodoPago || "No especificado"}</p>
                  <p><strong>Último Pago:</strong> {formatearFecha(cliente.ultimoPago)}</p>
                  <p><strong>Renovación:</strong> {formatearFecha(cliente.renovacion)}</p>
                </div>
              </div>

              {cliente.membresia && (
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <p><strong>Membresía:</strong> {cliente.membresia.titulo} - S/ {cliente.membresia.precio}</p>
                </div>
              )}

              {cliente.entrenador && (
                <div className="mt-2">
                  <p><strong>Entrenador:</strong> {cliente.entrenador.nombre} ({cliente.entrenador.edad} años)</p>
                </div>
              )}

              <div className="mt-3 text-sm text-gray-500">
                <p><strong>Fecha de registro:</strong> {formatearFecha(cliente.createdAt)}</p>
              </div>
            </div>
          ))
        ) : !loading && !error ? (
          <div className="text-center py-8">
            <p className="text-gray-500">
              {query ? "No se encontraron miembros con ese criterio de búsqueda." : "No hay miembros registrados."}
            </p>
          </div>
        ) : null}
      </div>

      {!loading && (
        <div className="mt-4 text-center">
          <button
            onClick={obtenerTodosLosClientes}
            className="text-red-800 hover:text-red-600 underline"
          >
            Recargar lista de miembros
          </button>
        </div>
      )}
    </div>
  );
};

export default Busquedadclientesmeses;
