"use client"

import { ChartAreaInteractive } from "../../components/Graficos/Graficodelineas"
import { ChartPieInteractive } from "../../components/Graficos/Graficodepie"
import ChartPieInteractive2 from "../../components/Graficos/Graficodepie2" // 👈 ahora default import

function Ingresos() {
  return (
    <div
      className="p-6 min-h-screen"
      style={{
        backgroundColor: "#ffffff", // blanco
        backgroundImage: `
          linear-gradient(to right, rgba(0,0,0,0.05) 1px, transparent 1px),
          linear-gradient(to bottom, rgba(0,0,0,0.05) 1px, transparent 1px)
        `,
        backgroundSize: "40px 40px", // tamaño de los cuadritos
      }}
    >
      <h1 className="text-2xl font-bold mb-6">Dashboard de Ingresos</h1>

      {/* Gráfico de líneas arriba */}
      <div className="mb-8">
        <ChartAreaInteractive />
      </div>

      {/* Gráficos de pie lado a lado */}
      <div className="flex flex-col md:flex-row justify-center gap-20">
        {/* Izquierda */}
        <div className="w-full md:w-1/3">
          <ChartPieInteractive />
        </div>

        {/* Derecha */}
        <div className="w-full md:w-1/3">
          <ChartPieInteractive2 />
        </div>
      </div>
    </div>
  )
}

export default Ingresos
