const PDFDocument = require("pdfkit-table");
const ClientesPorDia = require("../Modelos/ClientesporDia");
const mongoose = require("mongoose");
const Trabajador = require('../Modelos/Trabajador');
const path = require("path");
const fs = require("fs");

// Función para obtener el rango de la semana actual (Lunes a Domingo)
function getWeekRange(date = new Date()) {
  const today = new Date(date);
  today.setHours(0, 0, 0, 0);
  const day = today.getDay();

  const diffToMonday = today.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(today.setDate(diffToMonday));

  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);

  return { monday, sunday };
}

// Función para dibujar tabla
function drawTable(doc, x, y, headers, data, columnWidths, options = {}) {
  let currentY = y;
  const {
    rowHeight = 25,
    headerColor = '#852b33',
    evenRowColor = '#e5e7eb',
    oddRowColor = '#b3b4b7',
    textColor = '#212121',
    headerTextColor = '#FFFFFF',
    borderColor = '#1c1c1d',
    highlightColumn = -1,
    highlightHeaderTextColor = '#facc15',
  } = options;

  const tableWidth = columnWidths.reduce((a, b) => a + b, 0);

  // Cabecera
  doc.rect(x, currentY, tableWidth, rowHeight).fill(headerColor);
  let currentX = x;
  headers.forEach((header, index) => {
    if (index === highlightColumn) {
        doc.fillColor(highlightHeaderTextColor);
    } else {
        doc.fillColor(headerTextColor);
    }
    doc.fontSize(10).font("Helvetica-Bold");
    doc.text(header, currentX + 5, currentY + 8, {
      width: columnWidths[index] - 10,
      align: "center"
    });
    currentX += columnWidths[index];
  });

  currentY += rowHeight;

  // Filas
  data.forEach((row, rowIndex) => {
    const fillColor = rowIndex % 2 === 0 ? evenRowColor : oddRowColor;
    currentX = x;
    doc.rect(x, currentY, tableWidth, rowHeight).fill(fillColor);

    row.forEach((cell, cellIndex) => {
      const isLastRow = rowIndex === data.length - 1;
      const isPaymentTable = headers.includes("Método de Pago");
      const font = (isLastRow && isPaymentTable) ? "Helvetica-Bold" : "Helvetica";

      doc.fillColor(textColor).fontSize(9).font(font);

      const alignment = (cellIndex === 0 && isPaymentTable) ? "left" : "center";
      let cellText = cell;

      if (typeof cell === 'number') {
        if (headers[cellIndex].toLowerCase().includes('clientes')) {
          cellText = cell.toString();
        } else {
          cellText = `S/ ${cell.toFixed(2)}`;
        }
      }

      doc.text(cellText.toString(), currentX + 5, currentY + 8, {
        width: columnWidths[cellIndex] - 10,
        align: alignment
      });

      currentX += columnWidths[cellIndex];
    });

    currentY += rowHeight;
  });

  doc.rect(x, y, tableWidth, currentY - y).stroke(borderColor);
  return currentY;
}

exports.generarReporteClientesPorDia = async (req, res) => {
  try {
    const { rol, id, gym_id } = req.usuario;

    // --- Datos ---
    const matchQuery = {};
    if (rol === "trabajador") {
      matchQuery.creadorId = new mongoose.Types.ObjectId(id);
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const resumenPagosHoy = await ClientesPorDia.aggregate([
      { $match: { ...matchQuery, fecha: { $gte: today, $lt: tomorrow } } },
      {
        $group: {
          _id: "$metododePago",
          total: { $sum: "$monto" },
          count: { $sum: 1 },
        },
      },
    ]);

    const { monday, sunday } = getWeekRange();
    const ingresosSemana = await ClientesPorDia.aggregate([
      { $match: { ...matchQuery, fecha: { $gte: monday, $lte: sunday } } },
      {
        $group: {
          _id: { $dayOfWeek: { date: "$fecha", timezone: "America/Lima" } },
          total: { $sum: "$monto" },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const resumenHoyProcesado = { Yape: { total: 0, count: 0 }, Plin: { total: 0, count: 0 }, Efectivo: { total: 0, count: 0 } };
    let totalHoy = 0, totalClientesHoy = 0;
    resumenPagosHoy.forEach((item) => {
      if (resumenHoyProcesado.hasOwnProperty(item._id)) {
        resumenHoyProcesado[item._id].total = item.total;
        resumenHoyProcesado[item._id].count = item.count;
      }
      totalHoy += item.total;
      totalClientesHoy += item.count;
    });

    const ingresosSemanaProcesado = Array(7).fill(0);
    ingresosSemana.forEach((item) => {
      ingresosSemanaProcesado[item._id - 1] = item.total;
    });
    const ingresosSemanaLunesPrimero = ingresosSemanaProcesado.slice(1);
    const totalSemana = ingresosSemanaProcesado.reduce((a, b) => a + b, 0);

    // --- PDF directo a respuesta ---
    const doc = new PDFDocument({ margin: 40, size: "A4" });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=reporte_clientes.pdf");

    doc.pipe(res);

    const pageWidth = doc.page.width;

    // Logo - intentar cargar si existe
    const logoPath = path.join(__dirname, '..', 'gimnasio-frontend', 'public', 'images', 'logo.jpg');
    
    const logoSize = 80;
    const logoX = 50;
    const logoY = 10;

    // Solo dibujar logo si existe el archivo
    if (fs.existsSync(logoPath)) {
      try {
        doc.save();
        doc.circle(logoX + logoSize / 2, logoY + logoSize / 2, logoSize / 2).clip();
        doc.image(logoPath, logoX, logoY, { width: logoSize, height: logoSize });
        doc.restore();

        // Borde del logo
        doc.circle(logoX + logoSize / 2, logoY + logoSize / 2, logoSize / 2)
           .lineWidth(2)
           .strokeColor("#fff")
           .stroke();
      } catch (err) {
        console.log("Error al cargar logo, continuando sin logo:", err.message);
      }
    }

    doc.fontSize(18).font("Helvetica-Bold").text("REPORTE DE INGRESOS DIARIOS", { align: "center" });
    doc.moveDown();

    const fechaActual = new Date().toLocaleDateString("es-ES", { year: "numeric", month: "long", day: "numeric" });
    doc.fontSize(10).font("Helvetica").text(`Fecha: ${fechaActual}`, { align: "right" });

    let generadoPorText = "Sistema";
    if (rol === "admin") generadoPorText = "Administrador";
    if (rol === "trabajador") {
      const trabajador = await Trabajador.findById(id);
      generadoPorText = trabajador ? ` ${trabajador.nombre}` : "Trabajador: Desconocido";
    }

    doc.fontSize(10).font("Helvetica-Oblique").text(`Generado por: ${generadoPorText}`, { align: "right" });
    doc.moveDown(2);

    let currentY = doc.y;
    const tableWidth = 515;
    const tableStartX = (pageWidth - tableWidth) / 2;

    // Tabla del día
    doc.fontSize(12).font("Helvetica-Bold").text("Resumen de Ingresos del Día", tableStartX, currentY, { align: "left" });
    currentY += 25;

    const headersPagos = ["Método de Pago", "Nº Clientes", "Total Ingresos"];
    const columnWidthsPagos = [215, 150, 150];
    const datosPagos = [
      ["Yape", resumenHoyProcesado.Yape.count, resumenHoyProcesado.Yape.total],
      ["Plin", resumenHoyProcesado.Plin.count, resumenHoyProcesado.Plin.total],
      ["Efectivo", resumenHoyProcesado.Efectivo.count, resumenHoyProcesado.Efectivo.total],
      ["TOTAL GENERAL", totalClientesHoy, totalHoy],
    ];
    currentY = drawTable(doc, tableStartX, currentY, headersPagos, datosPagos, columnWidthsPagos);
    currentY += 30;

    // Tabla semanal
    doc.fontSize(12).font("Helvetica-Bold").text("Resumen de Ingresos de la Semana", tableStartX, currentY, { align: "left" });
    currentY += 30;

    const dayOfWeek = today.getDay();
    const currentDayIndex = dayOfWeek > 0 ? dayOfWeek - 1 : 6; // Lunes=0, Martes=1,... Domingo=6

    const diasSemanaLunesPrimero = ["LUNES", "MARTES", "MIÉRCOLES", "JUEVES", "VIERNES", "SÁBADO"];
    const headersSemanal = [...diasSemanaLunesPrimero, "Total Semanal"];
    const columnWidthsSemanal = [65, 65, 70, 65, 65, 65, 125];
    const ingresosSemanalSeguros = ingresosSemanaLunesPrimero.map((valor) => valor || 0);
    const datosSemanal = [ingresosSemanalSeguros.concat([totalSemana])];

    drawTable(doc, tableStartX, currentY, headersSemanal, datosSemanal, columnWidthsSemanal, { highlightColumn: currentDayIndex });

    doc.end();

  } catch (err) {
    console.error("Error en generarReporteClientesPorDia:", err);
    res.status(500).json({ error: "Error al generar el reporte PDF." });
  }
};
