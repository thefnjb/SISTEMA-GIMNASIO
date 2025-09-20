"use client";

import React, { useState, useEffect } from "react";
import {
  PieChart,
  Pie,
  Sector,
  Label,
  Tooltip as ReTooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import api from "../../utils/axiosInstance"; // Importar la instancia de axios

const meses = [
  { value: 1, label: "Enero" },
  { value: 2, label: "Febrero" },
  { value: 3, label: "Marzo" },
  { value: 4, label: "Abril" },
  { value: 5, label: "Mayo" },
  { value: 6, label: "Junio" },
  { value: 7, label: "Julio" },
  { value: 8, label: "Agosto" },
  { value: 9, label: "Septiembre" },
  { value: 10, label: "Octubre" },
  { value: 11, label: "Noviembre" },
  { value: 12, label: "Diciembre" },
];

function ChartPieInteractive() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [activeIndex, setActiveIndex] = useState(-1);

  // 🔥 Generar dinámicamente años (desde 2020 hasta el actual)
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - 2019 }, (_, i) => 2020 + i);

  const fetchData = async (month, year) => {
    try {
      setLoading(true);
      const response = await api.get("/members/miembros"); // Usar api.get

      const apiData = response.data.miembros || response.data;

      const clientesFiltrados = apiData.filter((m) => {
        if (!m.fechaIngreso) return false;
        const fecha = new Date(m.fechaIngreso);
        return fecha.getMonth() + 1 === month && fecha.getFullYear() === year;
      });

      const ganancia = clientesFiltrados.reduce((acc, m) => {
        const precio = Number(m?.mensualidad?.precio ?? m?.membresia?.precio ?? 0);
        return acc + precio;
      }, 0);

      const totalClientes = clientesFiltrados.length;

      setData([
        { name: "Ganancia", value: ganancia, fill: "#dc2626" }, // rojo
        { name: "Clientes", value: totalClientes, fill: "#000000" }, // negro
      ]);
    } catch (err) {
      console.error(err);
      setError(err.message);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(selectedMonth, selectedYear);
  }, [selectedMonth, selectedYear]);

  return (
    <div className="rounded-lg shadow p-6">
      {/* Encabezado con título y selects */}
      <div className="flex items-center justify-between pb-4 border-b border-gray-200 mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            Clientes Proporción
          </h3>
          <p className="text-sm text-gray-600">Clientes con Mensualidad</p>
        </div>
        <div className="flex gap-2">
          {/* Select Mes */}
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(Number(e.target.value))}
            className="px-3 py-2 bg-black text-white border border-gray-700 rounded-lg"
          >
            {meses.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </select>

          {/* Select Año (dinámico) */}
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="px-3 py-2 bg-black text-white border border-gray-700 rounded-lg"
          >
            {years.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Cuerpo con leyenda izquierda y gráfico derecha */}
      <div className="flex flex-col md:flex-row gap-6">
        {/* Leyenda izquierda */}
        <div className="flex flex-col justify-center gap-4 md:w-1/4">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-600 rounded-sm" />
            <span className="text-gray-700 font-medium">Ganancia</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-black rounded-sm" />
            <span className="text-gray-700 font-medium">
              Cantidad de Clientes
            </span>
          </div>
        </div>

        {/* Gráfico derecha */}
        <div className="flex-1">
          {loading ? (
            <p className="text-center text-gray-600">Cargando...</p>
          ) : error ? (
            <p className="text-red-500">Error: {error}</p>
          ) : data.length === 0 ? (
            <p className="text-gray-500 text-center">No hay datos para este mes</p>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <ReTooltip />
                <Pie
                  data={data}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={60}
                  outerRadius={100}
                  stroke="#fff"
                  strokeWidth={2}
                  activeIndex={activeIndex}
                  activeShape={(props) => (
                    <g>
                      <Sector {...props} outerRadius={props.outerRadius + 10} />
                      <Sector
                        {...props}
                        outerRadius={props.outerRadius + 25}
                        innerRadius={props.outerRadius + 12}
                      />
                    </g>
                  )}
                  onMouseEnter={(_, index) => setActiveIndex(index)}
                  onMouseLeave={() => setActiveIndex(-1)}
                >
                  {data.map((entry, index) => (
                    <Cell key={index} fill={entry.fill} />
                  ))}
                  <Label
                    content={({ viewBox }) => {
                      if (!viewBox) return null;
                      const ganancia =
                        data.find((d) => d.name === "Ganancia")?.value || 0;
                      return (
                        <text
                          x={viewBox.cx}
                          y={viewBox.cy}
                          textAnchor="middle"
                          dominantBaseline="middle"
                          className="fill-gray-900 font-bold text-2xl"
                        >
                          S/. {ganancia}
                          <tspan
                            x={viewBox.cx}
                            y={(viewBox.cy || 0) + 25}
                            className="fill-gray-500 font-normal text-sm"
                          >
                            Ganancia
                          </tspan>
                        </text>
                      );
                    }}
                  />
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}

export { ChartPieInteractive };
export default ChartPieInteractive;
