"use client"

import {Autocomplete, AutocompleteItem} from "@heroui/react"
import api from "../../utils/axiosInstance";

const currentYear = new Date().getFullYear()
const years = Array.from({ length: currentYear - 2000 + 1 }, (_, i) => {
  const year = currentYear - i
  return {
    label: `Año ${year}`,
    key: year.toString(),
  }
})

export default function Añosselector() {
  const handleDownload = async (year) => {
    if (!year) return;
    try {
      const response = await api.get(`/pdfdia/reporte-mensual`, {
        params: { year },
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `reporte-${year}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading the file:", error);
    }
  }

  return (
    <Autocomplete
      className="max-w-xs"
      defaultItems={years}
      label="Selecciona un año para descargar "
      onSelectionChange={(key) => handleDownload(key)}
    >
      {(year) => <AutocompleteItem key={year.key}>{year.label}</AutocompleteItem>}
    </Autocomplete>
  )
}