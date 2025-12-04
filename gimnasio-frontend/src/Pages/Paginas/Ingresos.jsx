"use client"

import { ChartAreaInteractive } from "../../components/Graficos/Graficodelineas"
import { ChartPieInteractive } from "../../components/Graficos/Graficodepie"
import ChartPieInteractive2 from "../../components/Graficos/Graficodepie2" 
import Añosselector from "../../components/Pdf/BotonpdfMensual"

function Ingresos() {
  return (
    <div
      className="min-h-screen p-3 sm:p-4 md:p-6"
      style={{
        backgroundColor: "#ffffff", // blanco
        backgroundImage: `
          linear-gradient(to right, rgba(0,0,0,0.05) 1px, transparent 1px),
          linear-gradient(to bottom, rgba(0,0,0,0.05) 1px, transparent 1px)
        `,
        backgroundSize: "40px 40px", // tamaño de los cuadritos
      }}
    >
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <Añosselector />
      </div>

      {/* Gráfico de líneas arriba */}
      <div className="mb-4 sm:mb-6 md:mb-8">
        <ChartAreaInteractive />
      </div>

      {/* Gráficos de pie lado a lado */}
      <div className="flex flex-col justify-center gap-8 sm:gap-12 md:gap-16 lg:gap-20 md:flex-row">
        {/* Izquierda */}
        <div className="w-full md:w-1/2 lg:w-1/3">
          <ChartPieInteractive />
        </div>

        {/* Derecha */}
        <div className="w-full md:w-1/2 lg:w-1/3">
          <ChartPieInteractive2 />
        </div>
      </div>
    </div>
  )
}

export default Ingresos
