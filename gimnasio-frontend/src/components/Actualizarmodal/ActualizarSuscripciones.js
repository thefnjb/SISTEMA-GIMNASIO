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
import api from "../../utils/axiosInstance";

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
      <div className="flex items-start gap-3 px-4 py-3 text-green-800 bg-green-100 border border-green-400 rounded-lg shadow-lg">
        <div className="flex-shrink-0 mt-1">
          <div className="flex items-center justify-center w-6 h-6 font-bold text-white bg-green-500 rounded-full">
            ✓
          </div>
        </div>
        <div className="flex-1">
          <p className="text-sm font-bold">¡Éxito!</p>
          <p className="text-sm">{message}</p>
        </div>
        <button
          onClick={onClose}
          className="flex-shrink-0 px-1 text-lg font-bold text-green-700 hover:text-green-900"
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
  const [planes, setPlanes] = useState([]);
  const [loadingPlanes, setLoadingPlanes] = useState(false);
  const [planError, setPlanError] = useState(null);
  const [selectedPlanId, setSelectedPlanId] = useState(null);
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
        const apiCallPromise = api.get("/trainers/ver");
        const [res] = await Promise.all([apiCallPromise]);
        setEntrenadores(res.data || []);
      } catch (e) {
        console.error("No se pudieron cargar entrenadores", e);
        setErrors(prev => ({ ...prev, general: "No se pudieron cargar entrenadores" }));
      }
    };
    cargarEntrenadores();
  }, []);

  // Cargar planes (membresías) cuando se abra en modo renovar
  useEffect(() => {
    const fetchPlanes = async () => {
      if (modo !== "renovar") return;
      setLoadingPlanes(true);
      setPlanError(null);
      try {
        const res = await api.get("/plans/vermembresia");
        // res.data puede ser un arreglo
        setPlanes(Array.isArray(res.data) ? res.data : (res.data?.plans || []));
      } catch (err) {
        console.error("Error cargando planes", err);
        setPlanError("No se pudieron cargar las membresías");
      } finally {
        setLoadingPlanes(false);
      }
    };
    fetchPlanes();
  }, [modo]);

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
      await api.put(`/members/miembros/${miembro._id}`,
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
      await api.post(
        `/members/miembros/${miembro._id}/renovar`,
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
          <ModalHeader className={`p-4 ${headerBg} rounded-t-lg`}>
            {modo === "renovar" ? (
              <div className="w-full text-center">
                <div className="text-2xl font-bold text-red-400">Renovar membresía</div>
                <p className="mt-1 text-sm text-gray-200">Agrega meses, deuda y confirma el nuevo vencimiento</p>
              </div>
            ) : (
              <div className="flex flex-col gap-1">
                <h2 className="text-xl font-semibold text-white">Editar miembro</h2>
                <p className="text-sm text-gray-200">Actualiza datos principales del miembro</p>
              </div>
            )}
          </ModalHeader>

          <ModalBody className="p-4">
            {errors.general && (
              <div className="p-2 mb-3 text-sm text-red-300 rounded bg-red-900/20">
                {errors.general}
              </div>
            )}

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {/* Nombre */}
              {modo !== "renovar" && (
                <div className="p-3 bg-gray-800 border rounded-md border-neutral-700">
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
              )}

              {/* Teléfono */}
              {modo !== "renovar" && (
                <div className="p-3 bg-gray-800 border rounded-md border-neutral-700">
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
              )}

              {/* Método de pago */}
              {modo !== "renovar" && (
                <div className="p-3 bg-gray-800 border rounded-md border-neutral-700">
                  <p className="mb-2 text-sm font-medium text-gray-200">Método de pago</p>
                  <div className="flex gap-2">
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
              )}
                {/* Entrenador */}
                {modo !== "renovar" && (
                  <div className="p-3 bg-gray-800 border rounded-md md:col-span-2 border-neutral-700">
                    <p className="mb-2 text-sm font-medium text-gray-200">Entrenador</p>
                    <select
                      className="w-full px-3 py-2 text-white border rounded-md bg-neutral-900 border-neutral-700"
                      value={datos.entrenador}
                      onChange={(e) => setDatos({ ...datos, entrenador: e.target.value })}
                    >
                      <option value="" className="text-white bg-neutral-900">Sin entrenador</option>
                      {Array.isArray(entrenadores) &&
                        entrenadores.map((t) => (
                          <option key={t._id} value={t._id} className="text-white bg-neutral-900">
                            {t.nombre}
                          </option>
                        ))}
                    </select>
                  </div>
                )}


              {/* Renovación */}
              {modo === "renovar" && (
                <div className="pt-4 border-t md:col-span-2 border-neutral-700">
                  {/* Sección estilo "selección" similar a ModalSeleccionarMembresia */}
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                      {loadingPlanes ? (
                        <div className="col-span-3 p-3 text-center text-gray-400">Cargando membresías...</div>
                      ) : planError ? (
                        <div className="col-span-3 p-3 text-center text-red-400">{planError}</div>
                      ) : planes.length === 0 ? (
                        <div className="col-span-3 p-3 text-center text-gray-400">No hay membresías disponibles</div>
                      ) : (
                        planes.map((plan) => {
                          const dur = Number(plan.duracion || plan.meses || plan.numero || 0);
                          const selected = selectedPlanId === plan._id;
                          return (
                            <button
                              key={plan._id}
                              type="button"
                              onClick={() => { setSelectedPlanId(plan._id); setMesesAgregar(dur); }}
                              className={`p-3 rounded-lg cursor-pointer transition-colors text-left border ${selected ? 'border-red-500 bg-gray-700 ring-2 ring-red-600' : 'border-neutral-700 bg-gray-800 hover:bg-gray-700'}`}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex flex-col">
                                  <span className="font-medium text-white">{dur === 12 ? '1 Año' : `+${dur} mes${dur > 1 ? 'es' : ''}`}</span>
                                  <span className="text-sm text-gray-400">Turno: {plan.turno || '-'}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  {selected && (
                                    <span className="inline-block font-bold text-red-400">✓</span>
                                  )}
                                  <span className="text-sm font-semibold text-green-400">{`S/ ${Number(plan.precio || 0).toFixed(2)}`}</span>
                                </div>
                              </div>
                            </button>
                          );
                        })
                      )}
                    </div>

                    <div className="flex flex-col gap-3">
                      {/* Contenedor mejorado para input de meses y info de deuda actual */}
                      <div className="flex flex-col gap-3">
                        <div className="p-3 bg-gray-800 border rounded-md border-neutral-700">
                          <div className="text-sm text-gray-400">Deuda actual</div>
                          <div className="font-semibold text-white">S/ {Number(deuda || 0).toFixed(2)}</div>
                        </div>
                      </div>

                      {/* Fechas ordenadas y claras */}
                      <div className="grid grid-cols-1 gap-3 mt-2 text-sm sm:grid-cols-2">
                        <div className="p-3 bg-gray-800 border rounded-md border-neutral-700">
                          <div className="text-gray-400">Vence actualmente</div>
                          <div className="font-semibold text-white">{formatearFecha(vencimientoActual)}</div>
                        </div>

                        <div className="p-3 bg-gray-800 border rounded-md border-neutral-700">
                          <div className="text-gray-400">Vencimiento estimado</div>
                          <div className="font-semibold text-white">{formatearFecha(vencimientoEstimado)}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ModalBody>

          <ModalFooter className="flex justify-end gap-2 p-4 rounded-b-lg bg-black/80">
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
              className="text-white bg-transparent border-neutral-700"
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
