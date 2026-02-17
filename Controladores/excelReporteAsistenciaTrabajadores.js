const ExcelJS = require("exceljs");
const RegistroAsistencia = require("../Modelos/RegistroAsistencia");
const Trabajador = require("../Modelos/Trabajador");
const Gym = require("../Modelos/Gimnasio");

function formatDate(date) {
  if (!date) return "-";
  const d = new Date(date);
  return d.toLocaleDateString("es-PE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  });
}

function formatTime(date) {
  if (!date) return "-";
  try {
    const d = new Date(date);
    if (isNaN(d.getTime())) return "-";
    
    let horas = d.getHours();
    const minutos = String(d.getMinutes()).padStart(2, '0');
    const segundos = String(d.getSeconds()).padStart(2, '0');
    const periodo = horas >= 12 ? "PM" : "AM";
    
    // Convertir a formato 12 horas
    horas = horas === 0 ? 12 : horas > 12 ? horas - 12 : horas;
    horas = String(horas).padStart(2, '0');
    
    return `${horas}:${minutos}:${segundos} ${periodo}`;
  } catch (error) {
    console.error("Error al formatear hora:", error);
    return "-";
  }
}

function calcularDuracion(entrada, salida) {
  if (!entrada || !salida) return "-";
  const inicio = new Date(entrada);
  const fin = new Date(salida);
  const diff = fin - inicio;
  
  const horas = Math.floor(diff / (1000 * 60 * 60));
  const minutos = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const segundos = Math.floor((diff % (1000 * 60)) / 1000);
  
  const minutosFinales = minutos + (segundos > 0 ? 1 : 0);
  
  return `${horas}h ${minutosFinales}m`;
}

exports.generarReporteAsistenciaExcel = async (req, res) => {
  try {
    const { rol, id, gym_id } = req.usuario;
    const { trabajadorId } = req.params;
    const { fechaInicio, fechaFin, mes, año } = req.query;

    // Validar datos del usuario
    if (!rol || !id) {
      return res.status(401).json({ 
        error: "Usuario no autenticado correctamente" 
      });
    }

    // Solo admin puede generar reportes de cualquier trabajador
    const idTrabajador = rol === 'admin' ? trabajadorId : id;

    // Obtener datos del trabajador
    const trabajador = await Trabajador.findById(idTrabajador).select('nombre nombreUsuario gym');
    if (!trabajador) {
      return res.status(404).json({ error: "Trabajador no encontrado" });
    }

    // Verificar que el trabajador pertenece al gym del usuario
    if (rol === 'admin' && trabajador.gym?.toString() !== gym_id?.toString()) {
      return res.status(403).json({ error: "No tienes permiso para ver este reporte" });
    }

    const gymIdFinal = rol === 'admin' ? gym_id : trabajador.gym;

    // Obtener datos de la empresa
    const gym = await Gym.findById(gymIdFinal).select('nombreEmpresa');
    const nombreEmpresa = gym?.nombreEmpresa || "GIMNASIO TERRONES";

    // Construir query con filtros
    let query = {
      trabajador: idTrabajador,
      gym: gymIdFinal
    };

    // Filtro por rango de fechas
    if (fechaInicio && fechaFin) {
      const inicio = new Date(fechaInicio);
      inicio.setHours(0, 0, 0, 0);
      const fin = new Date(fechaFin);
      fin.setHours(23, 59, 59, 999);
      query.fechaEntrada = { $gte: inicio, $lte: fin };
    } 
    // Filtro por mes y año
    else if (mes && año) {
      const inicioMes = new Date(parseInt(año), parseInt(mes) - 1, 1);
      inicioMes.setHours(0, 0, 0, 0);
      const finMes = new Date(parseInt(año), parseInt(mes), 0);
      finMes.setHours(23, 59, 59, 999);
      query.fechaEntrada = { $gte: inicioMes, $lte: finMes };
    }
    // Filtro por fecha exacta
    else if (fechaInicio && !fechaFin) {
      const fecha = new Date(fechaInicio);
      fecha.setHours(0, 0, 0, 0);
      const fechaFinDia = new Date(fecha);
      fechaFinDia.setHours(23, 59, 59, 999);
      query.fechaEntrada = { $gte: fecha, $lte: fechaFinDia };
    }
    // Sin filtro: mostrar todos los registros

    // Obtener registros de asistencia
    const registros = await RegistroAsistencia.find(query)
      .sort({ fechaEntrada: -1 })
      .populate('trabajador', 'nombre nombreUsuario');

    if (!registros || registros.length === 0) {
      return res.status(404).json({ 
        error: "No se encontraron registros de asistencia" 
      });
    }

    // Obtener nombre del generador
    let generadoPor = "Administrador";
    if (rol === "trabajador") {
      generadoPor = trabajador.nombre || "Trabajador";
    }

    // Crear workbook de Excel
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Asistencia");

    // Estilo de encabezado
    const headerStyle = {
      font: { bold: true, color: { argb: 'FFFFFFFF' }, size: 11 },
      fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF852B33' } },
      alignment: { horizontal: 'center', vertical: 'middle' },
      border: {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      }
    };

    // Encabezado del reporte
    worksheet.mergeCells('A1:F1');
    const titleCell = worksheet.getCell('A1');
    titleCell.value = `REPORTE DE ASISTENCIA - ${nombreEmpresa.toUpperCase()}`;
    titleCell.font = { bold: true, size: 14, color: { argb: 'FF852B33' } };
    titleCell.alignment = { horizontal: 'center', vertical: 'middle' };

    worksheet.mergeCells('A2:F2');
    const fechaCell = worksheet.getCell('A2');
    fechaCell.value = `Fecha: ${new Date().toLocaleDateString("es-PE", { year: "numeric", month: "long", day: "numeric" })}`;
    fechaCell.font = { size: 10 };
    fechaCell.alignment = { horizontal: 'center' };

    worksheet.mergeCells('A3:F3');
    const generadoCell = worksheet.getCell('A3');
    generadoCell.value = `Generado por: ${generadoPor}`;
    generadoCell.font = { size: 10, italic: true };
    generadoCell.alignment = { horizontal: 'center' };

    worksheet.mergeCells('A4:F4');
    const trabajadorCell = worksheet.getCell('A4');
    trabajadorCell.value = `Trabajador: ${trabajador.nombre} | Usuario: ${trabajador.nombreUsuario} | Total Registros: ${registros.length}`;
    trabajadorCell.font = { bold: true, size: 10 };
    trabajadorCell.alignment = { horizontal: 'center' };

    // Encabezados de tabla
    const headers = ['N°', 'Fecha Entrada', 'Hora Entrada', 'Fecha Salida', 'Hora Salida', 'Duración'];
    const headerRow = worksheet.getRow(5);
    headers.forEach((header, index) => {
      const cell = headerRow.getCell(index + 1);
      cell.value = header;
      Object.assign(cell, headerStyle);
    });
    headerRow.height = 25;

    // Datos
    registros.forEach((registro, index) => {
      const horaEntradaStr = formatTime(registro.fechaEntrada);
      const horaSalidaStr = registro.fechaSalida ? formatTime(registro.fechaSalida) : "-";
      const fechaSalidaStr = registro.fechaSalida ? formatDate(registro.fechaSalida) : "Pendiente";
      const duracionStr = registro.fechaSalida ? calcularDuracion(registro.fechaEntrada, registro.fechaSalida) : "-";
      
      // Usar array en lugar de objeto para que los datos se mapeen correctamente
      const row = worksheet.addRow([
        index + 1,
        formatDate(registro.fechaEntrada),
        horaEntradaStr,
        fechaSalidaStr,
        horaSalidaStr,
        duracionStr
      ]);

      // Estilo de filas alternadas
      const fillColor = index % 2 === 0 ? "FFFFFFFF" : "FFF8F9FA";
      row.eachCell((cell) => {
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: fillColor }
        };
        cell.alignment = { vertical: "middle", horizontal: "center" };
        cell.border = {
          top: { style: "thin", color: { argb: "FFD1D5DB" } },
          left: { style: "thin", color: { argb: "FFD1D5DB" } },
          bottom: { style: "thin", color: { argb: "FFD1D5DB" } },
          right: { style: "thin", color: { argb: "FFD1D5DB" } }
        };
        if (cell.value === "Pendiente" || cell.value === "-") {
          cell.font = { bold: true, color: { argb: "FFF59E0B" } };
        }
      });
      row.height = 20;
    });

    // Ajustar ancho de columnas
    worksheet.columns = [
      { width: 8 },  // N°
      { width: 15 }, // Fecha Entrada
      { width: 15 }, // Hora Entrada
      { width: 15 }, // Fecha Salida
      { width: 15 }, // Hora Salida
      { width: 12 }  // Duración
    ];

    // Configurar respuesta HTTP
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=reporte_asistencia_${trabajador.nombreUsuario}.xlsx`
    );

    await workbook.xlsx.write(res);
    res.end();

  } catch (error) {
    console.error("Error al generar reporte Excel:", error);
    res.status(500).json({ error: "Error al generar el reporte Excel" });
  }
};

