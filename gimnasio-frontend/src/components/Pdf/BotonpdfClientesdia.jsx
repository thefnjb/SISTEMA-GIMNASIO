import React from "react";
import api from "../../utils/axiosInstance";
import { Button } from "@nextui-org/react";
import CloudDownloadRoundedIcon from '@mui/icons-material/CloudDownloadRounded';

const ReporteClientesDia = () => {
  const descargarPDF = async () => {
    try {
      const response = await api.get("/pdfdia/reporte-dia", {
        responseType: "blob", // importante para archivos
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`, // si usas JWT
        },
      });

      // Crear URL temporal para el blob
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "ReportesClienstesDía.pdf"); // nombre del archivo
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error descargando el PDF:", error);
    }
  };

  return (
    <Button
              color="danger"
              style={{ backgroundColor: "#7a0f16" }}
              variant="solid"
              onPress={descargarPDF}
            >
        <CloudDownloadRoundedIcon />
            </Button>
  );
};

export default ReporteClientesDia;
