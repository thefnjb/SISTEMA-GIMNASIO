import React from "react";
import { Button } from "@heroui/react";
import TableChartTwoToneIcon from "@mui/icons-material/TableChartTwoTone";
import api from "../../utils/axiosInstance"; 

export default function BotonExcel() {
  const descargarExcel = async () => {
    try {
      const response = await api.get("/export/excel/miembros", {
        responseType: "blob",
        headers: {
          Accept: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        },
      });

      // Crear nombre dinámico
      const nombreArchivo = `miembros_${new Date()
        .toLocaleDateString("es-PE")
        .replace(/\//g, "-")}.xlsx`;

      const blob = new Blob([response.data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", nombreArchivo);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("Error al descargar Excel:", error);
    }
  };

  return (
    <Button
      isIconOnly
      aria-label="Descargar Excel"
      color="success"
      onPress={descargarExcel}
    >
      <TableChartTwoToneIcon />
    </Button>
  );
}
