import React, { useEffect, useMemo, useState } from "react";
import {
  Input,
  Button,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter
} from "@nextui-org/react";
import axios from "axios";

const CustomAlert = ({ visible, message, onClose }) => {
  if (!visible) return null;

  return (
    <div
      style={{
        position: "fixed",
        bottom: "20px",
        right: "20px",
        zIndex: 9999,
        minWidth: "320px",
        transition: "all 0.3s ease-in-out",
        transform: visible ? "translateX(0)" : "translateX(100%)"
      }}
    >
      <div className="bg-green-100 border border-green-400 text-green-800 px-4 py-3 rounded-lg shadow-lg flex items-start gap-3">
        <div className="flex-shrink-0 mt-1">
          <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center text-white font-bold">
            ✓
          </div>
        </div>
        <div className="flex-1">
          <p className="font-bold text-sm">¡Éxito!</p>
          <p className="text-sm">{message}</p>
        </div>
        <button
          onClick={onClose}
          className="flex-shrink-0 text-green-700 hover:text-green-900 text-lg font-bold px-1"
        >
          ×
        </button>
      </div>
    </div>
  );
};

export default function ActualizarSuscripciones({
  miembro,
  modo = "editar",
  onClose,
  onUpdated
}) {
  const [datos, setDatos] = useState({
    nombreCompleto: "",
    telefono: "",
    metodoPago: "efectivo",
    entrenador: ""
  });

  const [errors, setErrors] = useState({ nombreCompleto: "", telefono: "", general: "" });
  const [entrenadores, setEntrenadores] = useState([]);
  const [mesesAgregar, setMesesAgregar] = useState(0);
  const [deuda, setDeuda] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [isRenewing, setIsRenewing] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  const vencimientoActual = useMemo(
    () => (miembro?.vencimiento ? new Date(miembro.vencimiento) : null),
    [miembro?.vencimiento]
  );

  const vencimientoEstimado = useMemo(() => {
    if (!mesesAgregar) return null;
    const ahora = new Date();
    const base = vencimientoActual && vencimientoActual > ahora ? vencimientoActual : ahora;
    const f = new Date(base);
    f.setMonth(f.getMonth() + Number(mesesAgregar));
    return f;
  }, [mesesAgregar, vencimientoActual]);

  useEffect(() => {
    setDatos({
      nombreCompleto: miembro?.nombreCompleto || "",
      telefono: miembro?.telefono || "",
      metodoPago: (miembro?.metodoPago || "efectivo").toLowerCase(),
      entrenador: miembro?.entrenador?._id || miembro?.entrenador || ""
    });
    setMesesAgregar(0);
    setDeuda(miembro?.debe || 0);
    setErrors({ nombreCompleto: "", telefono: "", general: "" });
  }, [miembro]);

  useEffect(() => {
    const cargarEntrenadores = async () => {
      try {
        const res = await axios.get("http://localhost:4000/trainers/ver", { withCredentials: true });
        setEntrenadores(res.data || []);
      } catch (e) {
        console.error("No se pudieron cargar entrenadores", e);
        setErrors(prev => ({ ...prev, general: "No se pudieron cargar entrenadores" }));
      }
    };
    cargarEntrenadores();
  }, []);

  const validarCampos = () => {
    const err = { nombreCompleto: "", telefono: "" };
    const nombre = (datos.nombreCompleto || "").trim();
    const telefono = (datos.telefono || "").trim();

    if (!nombre) err.nombreCompleto = "El nombre completo es obligatorio.";
    else if (!/^[A-Za-zÀ-ÿ\s'-]{2,60}$/.test(nombre)) {
      err.nombreCompleto = "Nombre inválido. Usa solo letras, espacios, '-' o '´' (2-60 caracteres).";
    }

    if (!telefono) err.telefono = "El teléfono es obligatorio.";
    else if (!/^\d{9}$/.test(telefono)) err.telefono = "El teléfono debe tener 9 dígitos numéricos.";

    setErrors(prev => ({ ...prev, ...err, general: "" }));
    return !err.nombreCompleto && !err.telefono;
  };

  const handleGuardar = async () => {
    if (!validarCampos()) return;
    setIsSaving(true);
    try {
      await axios.put(
        `http://localhost:4000/members/miembros/${miembro._id}`,
        {
          nombreCompleto: datos.nombreCompleto.trim(),
          telefono: datos.telefono,
          metodoPago: datos.metodoPago,
          entrenador: datos.entrenador || undefined
        },
        { withCredentials: true }
      );

      setToastMessage("¡Éxito! Miembro actualizado correctamente");
      setToastVisible(true);
      setTimeout(() => {
        setToastVisible(false);
        onClose();
      }, 2000);

      onUpdated();
    } catch (e) {
      console.error("Error guardando miembro", e);
      setErrors(prev => ({ ...prev, general: "No se pudieron guardar los cambios" }));
    } finally {
      setIsSaving(false);
    }
  };

  const handleRenovar = async () => {
    if (!mesesAgregar || mesesAgregar < 1) {
      setErrors(prev => ({ ...prev, general: "Selecciona meses a agregar" }));
      return;
    }
    setIsRenewing(true);
    try {
      await axios.post(
        `http://localhost:4000/members/miembros/${miembro._id}/renovar`,
        { meses: Number(mesesAgregar), debe: Number(deuda || 0) },
        { withCredentials: true }
      );
      setToastMessage("¡Éxito! Suscripción registrada correctamente");
      setToastVisible(true);
      setTimeout(() => {
        setToastVisible(false);
        onClose();
      }, 2000);

      onUpdated();
    } catch (e) {
      console.error("Error al renovar", e.response?.data || e);
      setErrors(prev => ({ ...prev, general: "No se pudo realizar la renovación" }));
    } finally {
      setIsRenewing(false);
    }
  };

  const formatearFecha = (f) => {
    if (!f) return "-";
    const d = new Date(f);
    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const yyyy = d.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
  };

  const handleNombreChange = (value) => {
    const limpio = value.replace(/[^A-Za-zÀ-ÿ\s'-]/g, "").slice(0, 60);
    setDatos(prev => ({ ...prev, nombreCompleto: limpio }));
    setErrors(prev => ({ ...prev, nombreCompleto: "" }));
  };

  const handleTelefonoChange = (value) => {
    const soloNums = value.replace(/\D/g, "").slice(0, 9);
    setDatos(prev => ({ ...prev, telefono: soloNums }));
    setErrors(prev => ({ ...prev, telefono: "" }));
  };

  const modalBg = modo === "renovar" ? "bg-neutral-900" : "bg-black";
  const headerBg = modo === "renovar" ? "bg-red-700" : "bg-gradient-to-r from-black via-neutral-800 to-red-700";
  const inputClass = "bg-white/5 text-white border-neutral-700 placeholder:text-gray-400";
  const labelClass = "text-sm font-medium text-gray-200";
  const btnPrimaryClass = "bg-red-600 hover:bg-red-700 text-white border-none shadow-sm";
  const btnDefaultClass = "bg-neutral-800 hover:bg-neutral-700 text-white border border-neutral-700";

  return (
    <>
      <Modal isOpen={true} onClose={onClose} size="2xl" scrollBehavior="inside" className="z-50">
        <ModalContent className={`${modalBg} text-white`}>
          <ModalHeader className={`flex flex-col gap-1 p-4 ${headerBg} rounded-t-lg`}>
            <h2 className="text-xl font-semibold text-white">
              {modo === "renovar" ? "Renovar membresía" : "Editar miembro"}
            </h2>
            <p className="text-sm text-gray-200">
              {modo === "renovar"
                ? "Agrega meses, deuda y confirma el nuevo vencimiento"
                : "Actualiza datos principales del miembro"}
            </p>
          </ModalHeader>

          <ModalBody className="p-4">
            {errors.general && (
              <div className="mb-3 text-sm text-red-300 bg-red-900/20 p-2 rounded">
                {errors.general}
              </div>
            )}

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {/* Nombre */}
              <div className={`${modo === "renovar" ? "hidden" : ""}`}>
                <label className={labelClass}>Nombre y Apellido</label>
                <Input
                  type="text"
                  placeholder="Juan Pérez"
                  value={datos.nombreCompleto}
                  onChange={(e) => handleNombreChange(e.target.value)}
                  onBlur={() => setDatos(prev => ({ ...prev, nombreCompleto: prev.nombreCompleto.trim() }))}
                  className={`w-full mt-2 ${inputClass}`}
                  clearable
                />
                {errors.nombreCompleto && (
                  <p className="mt-1 text-xs text-red-300">{errors.nombreCompleto}</p>
                )}
              </div>

              {/* Teléfono */}
              <div className={`${modo === "renovar" ? "hidden" : ""}`}>
                <label className={labelClass}>Teléfono</label>
                <Input
                  type="tel"
                  placeholder="987654321"
                  value={datos.telefono}
                  onChange={(e) => handleTelefonoChange(e.target.value)}
                  inputMode="numeric"
                  maxLength={9}
                  className={`w-full mt-2 ${inputClass}`}
                />
                <p className="mt-1 text-xs text-gray-300">Formato: 9 dígitos (ej.: 987654321)</p>
                {errors.telefono && <p className="mt-1 text-xs text-red-300">{errors.telefono}</p>}
              </div>

              {/* Método de pago */}
              <div className={`${modo === "renovar" ? "hidden" : ""}`}>
                <p className="text-sm font-medium text-gray-200 mb-2">Método de pago</p>
                <div className="grid grid-cols-3 gap-2">
                  {["yape", "plin", "efectivo"].map((m) => (
                    <Button
                      key={m}
                      size="sm"
                      variant={datos.metodoPago === m ? "solid" : "bordered"}
                      className={`${datos.metodoPago === m ? btnPrimaryClass : btnDefaultClass} capitalize`}
                      onClick={() => setDatos({ ...datos, metodoPago: m })}
                    >
                      {m}
                    </Button>
                  ))}
                </div>
              </div>
                {/* Entrenador */}
                <div className={`${modo === "renovar" ? "hidden" : ""} md:col-span-2`}>
                  <p className="text-sm font-medium text-gray-200 mb-2">Entrenador</p>
                  <select
                    className="w-full border rounded-md px-3 py-2 bg-neutral-900 text-white border-neutral-700"
                    value={datos.entrenador}
                    onChange={(e) => setDatos({ ...datos, entrenador: e.target.value })}
                  >
                    <option value="" className="bg-neutral-900 text-white">Sin entrenador</option>
                    {Array.isArray(entrenadores) &&
                      entrenadores.map((t) => (
                        <option key={t._id} value={t._id} className="bg-neutral-900 text-white">
                          {t.nombre}
                        </option>
                      ))}
                  </select>
                </div>


              {/* Renovación */}
              {modo === "renovar" && (
                <div className="md:col-span-2 border-t pt-4 border-neutral-700">
                  <p className="text-sm font-medium mb-2 text-gray-200">Renovar membresía</p>

                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    {[1, 3, 6].map((n) => (
                      <Button
                        key={n}
                        size="sm"
                        variant={mesesAgregar === n ? "solid" : "bordered"}
                        className={`${mesesAgregar === n ? btnPrimaryClass : btnDefaultClass}`}
                        onClick={() => setMesesAgregar(n)}
                      >
                        +{n} mes{n > 1 ? "es" : ""}
                      </Button>
                    ))}

                    <Input
                      type="number"
                      min={1}
                      max={12}
                      value={mesesAgregar || ""}
                      onChange={(e) => setMesesAgregar(Number(e.target.value))}
                      className="w-28 mt-1"
                      variant="bordered"
                      label="Meses"
                    />
                  </div>

               {/* Input de deuda */}
            <div className="flex flex-col gap-2 mt-2">
              <label className="text-sm font-medium text-gray-200">Monto de deuda</label>
              <Input
                type="number"
                min={0}
                value={deuda || 0}
                onChange={(e) => setDeuda(Number(e.target.value))}
                className="w-32"
                variant="bordered"
                placeholder="0"
              />

              <div className="text-sm flex flex-col gap-1 text-gray-200">
                <span>
                  Vence actualmente: <b>{formatearFecha(vencimientoActual)}</b>
                </span>
                <span>
                  Vencimiento estimado: <b>{formatearFecha(vencimientoEstimado)}</b>
                </span>
              </div>
            </div>

                </div>
              )}
            </div>
          </ModalBody>

          <ModalFooter className="flex gap-2 p-4 justify-end bg-black/80 rounded-b-lg">
            {modo === "editar" && (
              <Button
                color="primary"
                onPress={handleGuardar}
                isLoading={isSaving}
                className={btnPrimaryClass}
              >
                {isSaving ? "Guardando..." : "Guardar Cambios"}
              </Button>
            )}

            {modo === "renovar" && (
              <Button
                className={`${btnPrimaryClass}`}
                onPress={handleRenovar}
                isLoading={isRenewing}
              >
                {isRenewing ? "Renovando..." : "Confirmar Renovación"}
              </Button>
            )}

            <Button
              variant="bordered"
              onPress={onClose}
              className="bg-transparent text-white border-neutral-700"
            >
              Cancelar
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Alerta personalizada */}
      <CustomAlert
        visible={toastVisible}
        message={toastMessage}
        onClose={() => setToastVisible(false)}
      />
    </>
  );
}
