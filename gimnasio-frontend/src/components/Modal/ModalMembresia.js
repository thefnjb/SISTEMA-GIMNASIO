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
import api from "../../utils/axiosInstance"; // nuevo axios centralizado

const ModalMembresia = ({
  triggerText = "Ver Membresías",
  title = "Membresías Registradas",
}) => {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [membresias, setMembresias] = useState([]);
  const [titulo, setTitulo] = useState("");
  const [precio, setPrecio] = useState("");

  const obtenerMembresias = async () => {
    try {
      const res = await api.get("/plans/vermembresia");
      setMembresias(res.data);
    } catch (err) {
      console.error("Error al obtener membresías:", err);
    }
  };

  const agregarMembresia = async () => {
    if (!titulo.trim() || !/^\d+(\.\d{1,2})?$/.test(precio)) {
      alert("El precio debe ser un número válido.");
      return;
    }

    try {
      await api.post("/plans/nuevamembresia", {
        titulo: titulo.trim(),
        precio: Number(precio),
      });
      await obtenerMembresias();
      setTitulo("");
      setPrecio("");
    } catch (err) {
      console.error("Error al agregar/actualizar membresía:", err);
    }
  };

  const eliminarMembresia = async (id) => {
    try {
      await api.delete(`/plans/eliminarmembresia/${id}`);
      await obtenerMembresias();
    } catch (err) {
      console.error("Error al eliminar membresía:", err);
    }
  };

  useEffect(() => {
    if (isOpen) obtenerMembresias();
    else {
      setTitulo("");
      setPrecio("");
    }
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
                <div>
                  <label className="block mb-1 text-sm">Lista de Membresías</label>
                  <ul className="bg-white text-black rounded-lg p-3 space-y-2 max-h-[200px] overflow-y-auto">
                    {membresias.map((m, index) => (
                      <li
                        key={m._id || index}
                        className="flex items-center justify-between border-b pb-1 px-2 py-1 rounded-md transition-all duration-200 hover:bg-red-100 hover:text-red-700"
                      >
                        <span>
                          {m.titulo} — S/ {m.precio}
                        </span>
                        <button
                          onClick={() => eliminarMembresia(m._id)}
                          className="text-red-600 hover:text-red-800"
                          title="Eliminar"
                        >
                          <DeleteIcon fontSize="small" />
                        </button>
                      </li>
                    ))}
                    {membresias.length === 0 && (
                      <li>No hay membresías registradas.</li>
                    )}
                  </ul>
                </div>

                <div>
                  <label className="block mb-1 text-sm">Agregar</label>
                  <Input
                    placeholder="Ej. Mensual, Trimestral"
                    value={titulo}
                    onChange={(e) => setTitulo(e.target.value)}
                    className="text-white"
                  />
                  <Input
                    placeholder="Precio (Ej. 150)"
                    value={precio}
                    type="number"
                    onChange={(e) => setPrecio(e.target.value)}
                    className="mt-2 text-white"
                  />
                  <Button
                    className="mt-2 bg-red-600 hover:bg-red-700 text-white"
                    onPress={agregarMembresia}
                  >
                    Guardar
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

export { ModalMembresia };
