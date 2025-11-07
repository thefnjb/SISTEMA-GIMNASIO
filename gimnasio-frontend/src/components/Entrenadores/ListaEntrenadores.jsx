import { useEffect, useState } from "react";
import api from "../../utils/axiosInstance";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import { Avatar } from "@heroui/react";

export default function ListaEntrenadores({ refresh }) {
  const [entrenadores, setEntrenadores] = useState([]);

  // 🔹 Cargar entrenadores
  const fetchData = async () => {
    try {
      const res = await api.get("/trainers/ver", { withCredentials: true });
      setEntrenadores(res.data);
    } catch (error) {
      console.error("Error al obtener entrenadores:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, [refresh]);

  // 🔹 Eliminar entrenador
  const eliminarEntrenador = async (id) => {
    if (!window.confirm("¿Seguro que quieres eliminar este entrenador?")) return;

    try {
      await api.delete(`/trainers/eliminar/${id}`, { withCredentials: true });
      // Actualizar lista sin recargar
      setEntrenadores((prev) => prev.filter((ent) => ent._id !== id));
    } catch (err) {
      console.error("Error al eliminar entrenador:", err);
    }
  };

  // 🔹 Editar entrenador
  const editarEntrenador = (id) => {
    console.log("Editar entrenador:", id);
    // Aquí podrías abrir un modal o redirigir a otra ruta
    // window.location.href = `/trainers/editar/${id}`;
  };

  return (
    <div className="flex flex-col gap-4 p-4">
      {entrenadores.map((entrenador) => (
        <div
          key={entrenador._id}
          className="flex items-center justify-between p-4 transition border shadow-md rounded-xl backdrop-blur-md bg-white/10 border-white/20 hover:bg-white/20"
        >
          {/* Avatar + info */}
          <div className="flex items-center gap-4">
            <Avatar
              src={entrenador.fotoPerfil || "/images/default-avatar.png"}
              size="lg"
              className="border border-white/30"
            />
            <div>
              <h3 className="text-lg font-semibold text-white">{entrenador.nombre}</h3>
              <p className="text-sm text-gray-300">
                Edad: {entrenador.edad} | Tel: {entrenador.telefono}
              </p>
            </div>
          </div>

          {/* Botones editar + borrar (ambos rojos con hover oscuro) */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => editarEntrenador(entrenador._id)}
              className="p-2 text-red-500 transition rounded-full hover:bg-red-600/30"
              title="Editar entrenador"
            >
              <EditIcon />
            </button>

            <button
              onClick={() => eliminarEntrenador(entrenador._id)}
              className="p-2 text-red-500 transition rounded-full hover:bg-red-600/30"
              title="Eliminar entrenador"
            >
              <DeleteIcon />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
