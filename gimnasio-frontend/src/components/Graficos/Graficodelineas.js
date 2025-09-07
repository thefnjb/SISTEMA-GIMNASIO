"use client"

import { useState, useMemo, useEffect, useCallback } from "react"
import { AreaChart, Area, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts"
import api from "../../utils/axiosInstance" // Importar la instancia de axios

const chartConfig = {
  clientesPorDia: {
    label: "Clientes por Día",
    color: "#1f2937", // Negro/gris oscuro degradado
  },
  clientesPorMensualidad: {
    label: "Clientes Mensualidad",
    color: "#dc2626", // Rojo/granate como color principal del panel
  },
}

const AreaChartComponent = ({ data }) => {
  if (!data.length) return null

  const formatXAxisLabel = (tickItem) => {
    const date = new Date(tickItem)
    return date.toLocaleDateString("es-ES", { month: "short", timeZone: "UTC" })
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart
        data={data}
        margin={{
          top: 10,
          right: 30,
          left: 0,
          bottom: 0,
        }}
      >
        <defs>
          <linearGradient id="colorMensualidad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#dc2626" stopOpacity={0.8} />
            <stop offset="95%" stopColor="#dc2626" stopOpacity={0.1} />
          </linearGradient>
          <linearGradient id="colorDia" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#1f2937" stopOpacity={0.8} />
            <stop offset="95%" stopColor="#1f2937" stopOpacity={0.1} />
          </linearGradient>
        </defs>
        <XAxis
          dataKey="date"
          tickFormatter={formatXAxisLabel}
          stroke="#9ca3af"
          fontSize={12}
          axisLine={false}
          tickLine={false}
        />
        <YAxis hide />
        <Tooltip
          labelFormatter={(value) => {
            const date = new Date(value)
            return date.toLocaleDateString("es-ES", { month: "long", year: "numeric", timeZone: "UTC" })
          }}
          formatter={(value, name) => {
            const label = chartConfig[name]?.label || name
            return [value, label]
          }}
          itemStyle={{
            color: "#000000",
          }}
          itemSorter={(a, b) => {
            // Mostrar primero Clientes Mensualidad, luego Clientes por Día
            if (a.dataKey === "clientesPorMensualidad") return -1
            if (b.dataKey === "clientesPorMensualidad") return 1
            return 0
          }}
          content={({ active, payload, label }) => {
            if (active && payload && payload.length) {
              return (
                <div
                  style={{
                    backgroundColor: "#ffffff",
                    border: "1px solid #d1d5db",
                    borderRadius: "8px",
                    padding: "12px",
                    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                  }}
                >
                  <p style={{ color: "#000000", fontWeight: "500", margin: "0 0 8px 0" }}>
                    {new Date(label).toLocaleDateString("es-ES", { month: "long", year: "numeric", timeZone: "UTC" })}
                  </p>
                  {payload.map((entry, index) => (
                    <p
                      key={index}
                      style={{
                        margin: "4px 0",
                        color: entry.dataKey === "clientesPorMensualidad" ? "#dc2626" : "#1f2937",
                      }}
                    >
                      {chartConfig[entry.dataKey]?.label || entry.dataKey} : {entry.value}
                    </p>
                  ))}
                </div>
              )
            }
            return null
          }}
        />
        <Legend wrapperStyle={{ color: "#9ca3af" }} />
        <Area
          type="monotone"
          dataKey="clientesPorMensualidad"
          stackId="1"
          stroke="#dc2626"
          fill="url(#colorMensualidad)"
          name="Clientes Mensualidad"
        />
        <Area
          type="monotone"
          dataKey="clientesPorDia"
          stackId="2"
          stroke="#1f2937"
          fill="url(#colorDia)"
          name="Clientes por Día"
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}

export function ChartAreaInteractive() {
  const [timeRange, setTimeRange] = useState("12m")
  const [selectedYear, setSelectedYear] = useState(2025)
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [apiStatus, setApiStatus] = useState("checking")

  const checkApiConnection = useCallback(async () => {
    try {
      const baseUrl = process.env.REACT_APP_API_URL || "http://localhost:4000"
      console.log("[v0] Checking API connection to:", baseUrl)

      const response = await api.get(`/report/comparativo?year=${selectedYear}`)

      console.log("[v0] Response status:", response.status)
      console.log("[v0] Response ok:", response.status === 200)

      if (response.status !== 200) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const data = response.data
      console.log("[v0] API Response:", data)

      setApiStatus("connected")
      return data
    } catch (err) {
      console.error("[v0] API Connection Error:", err)
      setApiStatus("failed")
      throw err
    }
  }, [selectedYear])

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const comparativoData = await checkApiConnection()

      console.log("[v0] Raw API Response:", JSON.stringify(comparativoData, null, 2))
      console.log("[v0] Number of records:", comparativoData.length)

      comparativoData.forEach((item, index) => {
        console.log(`[v0] Record ${index}:`, {
          month: item.month,
          month_num: item.month_num,
          year: item.year,
          clientesPorDia: item.clientesPorDia,
          clientesPorMensualidad: item.clientesPorMensualidad,
          dataTypes: {
            clientesPorDia: typeof item.clientesPorDia,
            clientesPorMensualidad: typeof item.clientesPorMensualidad,
          },
        })
      })

      const chartData = comparativoData.map((item) => {
        const date = new Date(Date.UTC(item.year, item.month_num - 1, 2))
        return {
          date: date.toISOString().split("T")[0],
          month: item.month,
          clientesPorDia: Number(item.clientesPorDia) || 0,
          clientesPorMensualidad: Number(item.clientesPorMensualidad) || 0,
        }
      })

      console.log("[v0] Transformed data:", JSON.stringify(chartData, null, 2))

      const agostoData = chartData.find((item) => item.date === "2025-08-01")
      if (agostoData) {
        console.log("[v0] Agosto 2025 data:", agostoData)
        console.log("[v0] ¿Por qué clientesPorDia es 0 si hay 4 clientes hoy?")
      }

      setData(chartData)
    } catch (err) {
      console.error("[v0] Error fetching data:", err)
      setError(`${err.message}`)
      setData([])
    } finally {
      setLoading(false)
    }
  }, [checkApiConnection])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const filteredData = useMemo(() => {
    if (data.length === 0) return []

    if (timeRange === "12m") {
      return data
    }

    let monthsToShow = 12
    if (timeRange === "6m") monthsToShow = 6
    else if (timeRange === "3m") monthsToShow = 3

    const filtered = data.slice(-monthsToShow)
    console.log("[v0] Filtered data:", filtered)
    return filtered
  }, [data, timeRange])

  const handleYearChange = (value) => {
    const year = Number.parseInt(value)
    setSelectedYear(year)
  }

  return (
    <div
      className="p-6 rounded-lg shadow"
      style={{
  backgroundColor: "#ffffff",
}}

    >
      {error && (
        <div className="p-4 mb-4 border border-yellow-200 rounded-lg bg-yellow-50">
          <div className="flex items-center">
            <div className="text-yellow-800">
              <svg className="inline w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="font-medium">Aviso:</span> {error}
            </div>
          </div>
          <div className="mt-2 text-sm text-gray-600">
            <p>
              Estado de la API: <span className="font-medium">{apiStatus}</span>
            </p>
            <p>URL: {process.env.REACT_APP_API_URL || "http://localhost:4000"}</p>
            <p className="mt-1">Mostrando datos de ejemplo mientras tanto.</p>
          </div>
          <button
            onClick={() => fetchData()}
            className="px-4 py-2 mt-2 text-sm text-white bg-blue-600 rounded hover:bg-blue-700"
          >
            Reintentar
          </button>
        </div>
      )}

      <div className="flex items-center justify-between pb-4 mb-6 border-b border-gray-200">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Ingresos de Clientes</h3>
          <p className="text-sm text-gray-600">Comparación entre clientes por día vs clientes con mensualidad (POR MES)</p>
        </div>
        <div className="flex gap-2">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-3 py-2 text-gray-900 bg-white border border-gray-300 rounded-lg"
          >
            <option value="12m">Últimos 12 meses</option>
            <option value="6m">Últimos 6 meses</option>
            <option value="3m">Últimos 3 meses</option>
          </select>

          <select
            value={selectedYear}
            onChange={(e) => handleYearChange(e.target.value)}
            className="px-3 py-2 text-gray-900 bg-white border border-gray-300 rounded-lg"
          >
            <option value="2025">2025</option>
            <option value="2024">2024</option>
            <option value="2023">2023</option>
            <option value="2022">2022</option>
          </select>
        </div>
      </div>

      <div className="w-full h-80">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="w-8 h-8 mx-auto mb-2 border-b-2 border-gray-900 rounded-full animate-spin"></div>
              <p className="text-gray-600">Cargando datos...</p>
            </div>
          </div>
        ) : filteredData.length > 0 ? (
          <AreaChartComponent data={filteredData} />
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <p className="text-gray-600">No hay datos disponibles para mostrar</p>
              <p className="mt-2 text-sm text-gray-500">Verifica que tu API esté funcionando correctamente</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ChartAreaInteractive