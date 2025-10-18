import { useEffect, useState } from "react";
import api from "../../utils/axiosInstance";
import DeleteIcon from "@mui/icons-material/Delete";
import { Avatar } from "@heroui/react";

export default function ListaEntrenadores({ refresh }) {
  const [entrenadores, setEntrenadores] = useState([]);

  const fetchData = async () => {
    const res = await api.get("/trainers/ver", { withCredentials: true });
    setEntrenadores(res.data);
  };

  useEffect(() => {
    fetchData();
  }, [refresh]);

  const eliminarEntrenador = async (id) => {
    if (!window.confirm("¿Seguro que quieres eliminar este entrenador?")) return;

    try {
      await api.delete(`/trainers/eliminar/${id}`, {
        withCredentials: true,
      });
      // actualizar lista sin recargar
      setEntrenadores((prev) => prev.filter((ent) => ent._id !== id));
    } catch (err) {
      console.error("Error al eliminar entrenador:", err);
    }
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

          {/* Botón borrar */}
          <button
            onClick={() => eliminarEntrenador(entrenador._id)}
            className="p-2 text-red-500 transition rounded-full hover:bg-red-600/30"
            title="Eliminar entrenador"
          >
            <DeleteIcon />
          </button>
        </div>
      ))}
    </div>
  );
}
