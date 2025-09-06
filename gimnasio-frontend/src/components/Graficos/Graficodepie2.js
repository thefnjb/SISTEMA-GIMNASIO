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

function ChartPieInteractive2() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const fetchData = async (month, year) => {
    try {
      setLoading(true);
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
      const response = await fetch(
        `${baseUrl}/report/comparativo?year=${year}`
      );
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const apiData = await response.json();

      console.log("📌 Datos recibidos del backend:", apiData);

      // Buscar el registro del mes y año seleccionados
      const registro = apiData.find(
        (item) => item.month_num === month && item.year === year
      );

      if (!registro) {
        setData([]);
        return;
      }

      const totalClientesPorDia = Number(registro.clientesPorDia) || 0;

      // 💰 Precio fijo del día
      const precioDia = 7;
      const ganancia = totalClientesPorDia * precioDia;

      setData([
        { name: "Ganancia", value: ganancia, fill: "#000000" }, // negro
        { name: "Clientes por Día", value: totalClientesPorDia, fill: "#dc2626" }, // rojo
      ]);
    } catch (err) {
      console.error("Error fetching pie chart data:", err);
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
      {/* Encabezado */}
      <div className="flex items-center justify-between pb-4 border-b border-gray-200 mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            Clientes Proporción
          </h3>
          <p className="text-sm text-gray-600">
            Clientes por Día
          </p>
        </div>
        <div className="flex gap-2">
          {/* Select Mes */}
        <select
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(Number(e.target.value))}
          className="px-3 py-2 bg-red-600 text-black border border-red-700 rounded-lg"
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
          className="px-3 py-2 bg-red-600 text-black border border-red-700 rounded-lg"
        >
          <option value={2025}>2025</option>
          <option value={2024}>2024</option>
          <option value={2023}>2023</option>
          <option value={2022}>2022</option>
        </select>

        </div>
      </div>

      {/* Cuerpo con leyenda izquierda y gráfico derecha */}
      <div className="flex flex-col md:flex-row gap-6">
        {/* Leyenda izquierda */}
        <div className="flex flex-col justify-center gap-4 md:w-1/4">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-black rounded-sm" />
            <span className="text-gray-700 font-medium">Ganancia</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-600 rounded-sm" />
            <span className="text-gray-700 font-medium">Clientes por Día</span>
          </div>
        </div>

        {/* Gráfico derecha */}
        <div className="flex-1">
          {loading ? (
            <p className="text-center text-gray-600">Cargando...</p>
          ) : error ? (
            <p className="text-red-500">Error: {error}</p>
          ) : data.length === 0 ? (
            <p className="text-gray-500 text-center">No hay datos</p>
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

export default ChartPieInteractive2;
