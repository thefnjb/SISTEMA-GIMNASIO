const PDFDocument = require("pdfkit-table");
const RegistroAsistencia = require("../Modelos/RegistroAsistencia");
const Trabajador = require("../Modelos/Trabajador");
const Gym = require("../Modelos/Gimnasio");
const path = require("path");
const fs = require("fs");

// ===========================
// CONSTANTES Y CONFIGURACIÓN
// ===========================
const PDF_CONFIG = {
  margin: 40,
  size: "A4",
  colors: {
    primary: "#852b33",
    success: "#047857",
    dark: "#111827",
    gray: "#6b7280",
    lightGray: "#f3f4f6",
    border: "#d1d5db",
    white: "#FFFFFF",
    black: "#000000",
    evenRow: "#ffffff",
    oddRow: "#f8f9fa",
    warning: "#f59e0b"
  },
  table: {
    rowHeight: 40,
    maxRowsPerPage: 12,
    columnWidths: [35, 110, 90, 110, 90, 80],
    headers: ["N°", "Fecha Entrada", "Hora Entrada", "Fecha Salida", "Hora Salida", "Duración"]
  },
  text: {
    title: 18,
    subtitle: 14,
    normal: 10,
    tableHeader: 11,
    tableContent: 10,
    stats: 11
  }
};

// ===========================
// UTILIDADES
// ===========================

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
  const d = new Date(date);
  return d.toLocaleTimeString("es-PE", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit"
  });
}

function formatDateLong(date) {
  if (!date) return "-";
  const d = new Date(date);
  return d.toLocaleDateString("es-PE", {
    year: "numeric",
    month: "long",
    day: "numeric"
  });
}

function calcularDuracion(entrada, salida) {
  if (!entrada || !salida) return "-";
  const inicio = new Date(entrada);
  const fin = new Date(salida);
  const diff = fin - inicio;
  
  // Calcular horas y minutos
  const horas = Math.floor(diff / (1000 * 60 * 60));
  const minutos = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const segundos = Math.floor((diff % (1000 * 60)) / 1000);
  
  // Si hay al menos 1 segundo de diferencia, mostrar al menos 1 minuto
  const minutosFinales = minutos + (segundos > 0 ? 1 : 0);
  
  return `${horas}h ${minutosFinales}m`;
}


function dibujarLogo(doc, logoPath) {
  const logoSize = 80;
  const logoX = PDF_CONFIG.margin;
  const logoY = PDF_CONFIG.margin;

  if (fs.existsSync(logoPath)) {
    try {
      doc.save();
      doc.circle(logoX + logoSize / 2, logoY + logoSize / 2, logoSize / 2).clip();
      doc.image(logoPath, logoX, logoY, { width: logoSize, height: logoSize });
      doc.restore();
      doc.circle(logoX + logoSize / 2, logoY + logoSize / 2, logoSize / 2)
         .lineWidth(2)
         .strokeColor(PDF_CONFIG.colors.white)
         .stroke();
    } catch (err) {
      console.log("Error al cargar logo:", err.message);
    }
  }
}

function dibujarEncabezado(doc, pageWidth, generadoPor, logoPath, nombreEmpresa) {
  const headerHeight = 140;
  
  // Fondo del encabezado
  doc.rect(0, 0, pageWidth, headerHeight)
     .fillColor(PDF_CONFIG.colors.primary)
     .fill();

  // Logo
  dibujarLogo(doc, logoPath);

  // Título principal
  doc.fontSize(PDF_CONFIG.text.title)
     .font("Helvetica-Bold")
     .fillColor(PDF_CONFIG.colors.white)
     .text("REPORTE DE ASISTENCIA", 0, 35, { 
       align: "center", 
       width: pageWidth,
       lineGap: 5
     });

  // Subtítulo
  doc.fontSize(PDF_CONFIG.text.subtitle)
     .font("Helvetica")
     .fillColor(PDF_CONFIG.colors.white)
     .text("DE TRABAJADORES", 0, 58, { 
       align: "center", 
       width: pageWidth,
       lineGap: 3
     });

  // Nombre de la empresa
  doc.fontSize(12)
     .font("Helvetica-Bold")
     .fillColor(PDF_CONFIG.colors.white)
     .text(nombreEmpresa.toUpperCase(), 0, 75, { 
       align: "center", 
       width: pageWidth
     });

  // Fecha y generado por
  const fechaActual = formatDateLong(new Date());
  const infoX = pageWidth - PDF_CONFIG.margin;
  const infoWidth = 180;
  const infoY = 65;
  
  doc.fontSize(PDF_CONFIG.text.normal)
     .font("Helvetica")
     .fillColor(PDF_CONFIG.colors.white)
     .text(`Fecha: ${fechaActual}`, infoX - infoWidth, infoY, { 
       width: infoWidth, 
       align: "right",
       lineGap: 3
     });

  doc.fontSize(PDF_CONFIG.text.normal)
     .font("Helvetica-Oblique")
     .fillColor(PDF_CONFIG.colors.white)
     .text(`Generado por: ${generadoPor}`, infoX - infoWidth, infoY + 15, { 
       width: infoWidth, 
       align: "right",
       lineGap: 3
     });

  return headerHeight + 20;
}

function dibujarInfoTrabajador(doc, trabajador, pageWidth) {
  let currentY = PDF_CONFIG.margin + 150;

  // Nombre del trabajador
  doc.fontSize(PDF_CONFIG.text.subtitle)
     .font("Helvetica-Bold")
     .fillColor(PDF_CONFIG.colors.dark)
     .text(`Trabajador: ${trabajador.nombre}`, PDF_CONFIG.margin, currentY);

  currentY += 20;

  // Usuario
  doc.fontSize(PDF_CONFIG.text.normal)
     .font("Helvetica")
     .fillColor(PDF_CONFIG.colors.gray)
     .text(`Usuario: ${trabajador.nombreUsuario}`, PDF_CONFIG.margin, currentY);

  return currentY + 30;
}

function dibujarTabla(doc, x, y, headers, data, columnWidths, pageWidth) {
  const tableWidth = columnWidths.reduce((a, b) => a + b, 0);
  const tableStartX = (pageWidth - tableWidth) / 2;
  let currentY = y;
  const rowHeight = PDF_CONFIG.table.rowHeight;
  
  // Encabezado de la tabla
  let currentX = tableStartX;
  headers.forEach((header, index) => {
    // Primero dibujar el fondo
    doc.rect(currentX, currentY, columnWidths[index], rowHeight)
       .fillColor(PDF_CONFIG.colors.primary)
       .fill();
    
    // Luego dibujar el texto en blanco
    const alignment = index === 0 ? "center" : "left";
    doc.fontSize(PDF_CONFIG.text.tableHeader)
       .font("Helvetica-Bold")
       .fillColor(PDF_CONFIG.colors.white)
       .text(header, currentX + 8, currentY + 12, {
         width: columnWidths[index] - 16,
         align: alignment
       });
    
    currentX += columnWidths[index];
  });

  // Borde inferior del encabezado
  doc.moveTo(tableStartX, currentY + rowHeight)
     .lineTo(tableStartX + tableWidth, currentY + rowHeight)
     .strokeColor(PDF_CONFIG.colors.white)
     .lineWidth(2)
     .stroke();

  currentY += rowHeight;

  // Filas de datos
  data.forEach((row, rowIndex) => {
    // Verificar si necesita nueva página
    if (currentY + rowHeight > doc.page.height - PDF_CONFIG.margin * 2) {
      doc.addPage();
      
      // Redibujar encabezado en nueva página
      const headerHeight = 50;
      doc.rect(0, 0, pageWidth, headerHeight)
         .fillColor(PDF_CONFIG.colors.primary)
         .fill();
      
      doc.fontSize(12)
         .font("Helvetica-Bold")
         .fillColor(PDF_CONFIG.colors.white)
         .text("REPORTE DE ASISTENCIA - Continuación", 0, 15, { 
           align: "center", 
           width: pageWidth
         });
      
      currentY = headerHeight + 20;
      
      // Redibujar encabezado de tabla
      currentX = tableStartX;
      headers.forEach((header, index) => {
        // Primero dibujar el fondo
        doc.rect(currentX, currentY, columnWidths[index], rowHeight)
           .fillColor(PDF_CONFIG.colors.primary)
           .fill();
        
        // Luego dibujar el texto en blanco
        const alignment = index === 0 ? "center" : "left";
        doc.fontSize(PDF_CONFIG.text.tableHeader)
           .font("Helvetica-Bold")
           .fillColor(PDF_CONFIG.colors.white)
           .text(header, currentX + 8, currentY + 12, {
             width: columnWidths[index] - 16,
             align: alignment
           });
        
        currentX += columnWidths[index];
      });
      
      doc.moveTo(tableStartX, currentY + rowHeight)
         .lineTo(tableStartX + tableWidth, currentY + rowHeight)
         .strokeColor(PDF_CONFIG.colors.white)
         .lineWidth(2)
         .stroke();
      
      currentY += rowHeight;
    }

    const fillColor = rowIndex % 2 === 0 
      ? PDF_CONFIG.colors.evenRow 
      : PDF_CONFIG.colors.oddRow;

    // Fondo de fila
    doc.rect(tableStartX, currentY, tableWidth, rowHeight)
       .fillColor(fillColor)
       .fill();

    currentX = tableStartX;
    row.forEach((cell, cellIndex) => {
      // Separador vertical
      if (cellIndex > 0) {
        doc.moveTo(currentX, currentY)
           .lineTo(currentX, currentY + rowHeight)
           .strokeColor(PDF_CONFIG.colors.border)
           .lineWidth(0.5)
           .stroke();
      }

      const alignment = cellIndex === 0 ? "center" : "left";
      const cellColor = cell === "Pendiente" || cell === "-" 
        ? PDF_CONFIG.colors.warning 
        : PDF_CONFIG.colors.dark;
      
      doc.fontSize(PDF_CONFIG.text.tableContent)
         .font(cell === "Pendiente" ? "Helvetica-Bold" : "Helvetica")
         .fillColor(cellColor)
         .text(cell, currentX + 8, currentY + 12, {
           width: columnWidths[cellIndex] - 16,
           align: alignment
         });

      currentX += columnWidths[cellIndex];
    });

    // Borde inferior de fila
    doc.moveTo(tableStartX, currentY + rowHeight)
       .lineTo(tableStartX + tableWidth, currentY + rowHeight)
       .strokeColor(PDF_CONFIG.colors.border)
       .lineWidth(0.5)
       .stroke();

    currentY += rowHeight;
  });

  return currentY;
}

// ===========================
// GENERADOR PRINCIPAL
// ===========================

exports.generarReporteAsistenciaPDF = async (req, res) => {
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
    // Trabajador solo puede ver su propio reporte
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

    // Usar el gym_id del trabajador si es trabajador viendo su propio reporte
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

    // Crear documento PDF
    const doc = new PDFDocument({ 
      margin: PDF_CONFIG.margin, 
      size: PDF_CONFIG.size 
    });
    
    // Configurar respuesta HTTP
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition", 
      `attachment; filename=reporte_asistencia_${trabajador.nombreUsuario}.pdf`
    );
    doc.pipe(res);

    const pageWidth = doc.page.width;
    const logoPath = path.join(__dirname, '..', 'gimnasio-frontend', 'public', 'images', 'logo.jpg');

    // Dibujar encabezado
    dibujarEncabezado(doc, pageWidth, generadoPor, logoPath, nombreEmpresa);

    // Dibujar información del trabajador
    let currentY = dibujarInfoTrabajador(doc, trabajador, pageWidth);

    // Preparar datos de la tabla
    const tableData = registros.map((registro, index) => [
      (index + 1).toString(),
      formatDate(registro.fechaEntrada),
      formatTime(registro.fechaEntrada),
      registro.fechaSalida ? formatDate(registro.fechaSalida) : "Pendiente",
      registro.fechaSalida ? formatTime(registro.fechaSalida) : "-",
      registro.fechaSalida ? calcularDuracion(registro.fechaEntrada, registro.fechaSalida) : "-"
    ]);

    // Dibujar tabla
    dibujarTabla(
      doc,
      PDF_CONFIG.margin,
      currentY,
      PDF_CONFIG.table.headers,
      tableData,
      PDF_CONFIG.table.columnWidths,
      pageWidth
    );

    // Finalizar documento
    doc.end();

  } catch (error) {
    console.error("Error al generar reporte PDF:", error);
    res.status(500).json({ error: "Error al generar el reporte PDF" });
  }
};
