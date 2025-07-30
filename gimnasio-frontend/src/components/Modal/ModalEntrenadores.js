import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  useDisclosure,
} from "@heroui/react";
import { useEffect, useState } from "react";
import DeleteIcon from "@mui/icons-material/Delete";
import axios from "axios";

const ModalEntrenadores = ({
  triggerText = "Ver Entrenadores",
  title = "Entrenadores Registrados",
}) => {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  const [entrenadores, setEntrenadores] = useState([]);
  const [nombre, setNombre] = useState("");
  const [edad, setEdad] = useState("");
  const [telefono, setTelefono] = useState("");
  const [fotoPerfil, setFotoPerfil] = useState("");

  // Obtener entrenadores
  const obtenerEntrenadores = async () => {
    try {
      const res = await axios.get("http://localhost:4000/trainers/ver", {
        withCredentials: true,
      });
      setEntrenadores(res.data);
    } catch (err) {
      console.error("Error al obtener entrenadores:", err);
    }
  };

  // Agregar nuevo entrenador
  const agregarEntrenador = async () => {
    if (!nombre.trim() || !edad.trim() || !telefono.trim()) {
      alert("Completa todos los campos.");
      return;
    }

    try {
      await axios.post(
        "http://localhost:4000/trainers/nuevo",
        { nombre, edad, telefono, fotoPerfil },
        { withCredentials: true }
      );
      await obtenerEntrenadores();
      setNombre("");
      setEdad("");
      setTelefono("");
      setFotoPerfil("");
    } catch (err) {
      console.error("Error al agregar entrenador:", err);
    }
  };

  // Eliminar entrenador
  const eliminarEntrenador = async (id) => {
    try {
      await axios.delete(`http://localhost:4000/trainers/eliminar/${id}`, {
        withCredentials: true,
      });
      await obtenerEntrenadores();
    } catch (err) {
      console.error("Error al eliminar entrenador:", err);
    }
  };

  useEffect(() => {
    if (isOpen) obtenerEntrenadores();
  }, [isOpen]);

  return (
    <>
      <Button
        onPress={onOpen}
        className="text-white transition-all"
        style={{ backgroundColor: "#7a0f16" }}
      >
        {triggerText}
      </Button>

      <Modal
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        hideCloseButton
        backdrop="blur"
        isDismissable={false}
        className="bg-black text-white"
      >
        <ModalContent>
          {(onClose) => (
            <div className="bg-neutral-600 rounded-xl text-white">
              <ModalHeader>
                <div className="w-full text-center text-red-500 text-3xl font-bold">
                  {title}
                </div>
              </ModalHeader>

              <ModalBody className="space-y-4">
                {/* Lista de entrenadores */}
                <div>
                  <label className="block mb-1 text-sm">Lista de Entrenadores</label>
                  <ul className="bg-white text-black rounded-lg p-3 space-y-2 max-h-[200px] overflow-y-auto">
                    {entrenadores.map((ent) => (
                      <li
                        key={ent._id}
                        className="flex items-center justify-between border-b pb-1 px-2 py-1 rounded-md transition-all duration-200 hover:bg-red-100 hover:text-red-700"
                      >
                        <span>
                          {ent.nombre} — {ent.edad} años — {ent.telefono}
                        </span>
                        <button
                          onClick={() => eliminarEntrenador(ent._id)}
                          className="text-red-600 hover:text-red-800 transition"
                        >
                          <DeleteIcon fontSize="small" />
                        </button>
                      </li>
                    ))}
                    {entrenadores.length === 0 && (
                      <li>No hay entrenadores registrados.</li>
                    )}
                  </ul>
                </div>

                {/* Formulario agregar entrenador */}
                <div>
                  <label className="block mb-1 text-sm">Agregar Nuevo Entrenador</label>
                  <Input
                    placeholder="Nombre"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    className="text-white mb-2"
                  />
                  <Input
                    placeholder="Edad"
                    type="number"
                    value={edad}
                    onChange={(e) => setEdad(e.target.value)}
                    className="text-white mb-2"
                  />
                  <Input
                    placeholder="Teléfono"
                    value={telefono}
                    onChange={(e) => setTelefono(e.target.value)}
                    className="text-white mb-2"
                  />
                  <Input
                    placeholder="URL Foto de Perfil"
                    value={fotoPerfil}
                    onChange={(e) => setFotoPerfil(e.target.value)}
                    className="text-white mb-2"
                  />
                  <Button
                    className="mt-2 bg-red-600 hover:bg-red-700 text-white"
                    onPress={agregarEntrenador}
                  >
                    Agregar
                  </Button>
                </div>
              </ModalBody>

              <ModalFooter>
                <Button
                  color="danger"
                  variant="light"
                  onPress={onClose}
                  className="text-white border-white"
                >
                  Cerrar
                </Button>
              </ModalFooter>
            </div>
          )}
        </ModalContent>
      </Modal>
    </>
  );
};

export { ModalEntrenadores };
