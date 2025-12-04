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
import api from "../../utils/axiosInstance";

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

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - 2019 }, (_, i) => 2020 + i);

  const fetchData = async (month, year) => {
    try {
      setLoading(true);
      const response = await api.get("/members/miembros?all=true");

      const apiData = response.data.miembros || response.data;
      const miembrosArray = Array.isArray(apiData) ? apiData : apiData.miembros || [];

      const clientesFiltrados = miembrosArray.filter((m) => {
        if (!m.fechaIngreso) return false;
        const fecha = new Date(m.fechaIngreso);
        if (isNaN(fecha.getTime())) return false;
        const esDelMesYAnio = fecha.getMonth() + 1 === month && fecha.getFullYear() === year;
        return esDelMesYAnio;
      });

      const ganancia = clientesFiltrados.reduce((acc, m) => {
        const precio = Number(
          m?.totalAcumuladoMembresias ??
            m?.mensualidad?.precio ??
            m?.membresia?.precio ??
            0
        );
        return acc + precio;
      }, 0);

      const totalClientes = clientesFiltrados.length;

      setData([
        { name: "Ganancia", value: ganancia, fill: "#dc2626" },
        { name: "Clientes", value: totalClientes, fill: "#000000" },
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
    <div className="p-3 sm:p-4 md:p-6 rounded-lg shadow">
      {/* Encabezado con título y selects */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 mb-4 sm:mb-6 border-b border-gray-200">
        <div>
          <h3 className="text-base sm:text-lg font-semibold text-gray-900">
            Clientes Proporción
          </h3>
          <p className="text-xs sm:text-sm text-gray-600">Clientes por membresía</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          {/* Select Mes */}
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(Number(e.target.value))}
            className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-white bg-black border border-gray-700 rounded-lg"
          >
            {meses.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </select>

          {/* Select Año */}
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-white bg-black border border-gray-700 rounded-lg"
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
      <div className="flex flex-col gap-4 sm:gap-6 md:flex-row">
        {/* Leyenda izquierda */}
        <div className="flex flex-col justify-center gap-4 md:w-1/4">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-600 rounded-sm" />
            <span className="font-medium text-gray-700">Ganancia</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-black rounded-sm" />
            <span className="font-medium text-gray-700">
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
            <p className="text-center text-gray-500">No hay datos para este mes</p>
          ) : (
            <ResponsiveContainer width="100%" height={250} className="sm:h-[300px]">
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
                          className="text-2xl font-bold fill-gray-900"
                        >
                          S/. {ganancia}
                          <tspan
                            x={viewBox.cx}
                            y={(viewBox.cy || 0) + 25}
                            className="text-sm font-normal fill-gray-500"
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
