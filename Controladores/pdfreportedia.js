const PDFDocument = require("pdfkit-table");
const fs = require("fs");
const path = require("path");
const ClientesPorDia = require("../Modelos/ClientesporDia");
const mongoose = require("mongoose");
const Trabajador = require('../Modelos/Trabajador');

// Función para obtener el rango de la semana actual (Lunes a Domingo)
function getWeekRange(date = new Date()) {
  const today = new Date(date);
  today.setHours(0, 0, 0, 0);
  const day = today.getDay(); // Domingo: 0, Lunes: 1, ..., Sábado: 6

  // Ajustar para que la semana comience en Lunes
  const diffToMonday = today.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(today.setDate(diffToMonday));
  
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999); // Final del domingo

  return { monday, sunday };
}

// Función para dibujar tabla con diseño mejorado
function drawTable(doc, x, y, headers, data, columnWidths, options = {}) {
  let currentY = y;
  const { 
    rowHeight = 25,
    headerColor = '#852b33',      // Rojo fuerte
    evenRowColor = '#F5F5F5',     // Gris claro
    oddRowColor = '#FFFFFF',      // Blanco
    textColor = '#212121',        // Negro grisáceo (mejor contraste)
    headerTextColor = '#FFFFFF',  // Blanco para el encabezado
    borderColor = '#9E9E9E',      // Gris medio

  } = options;

  const tableWidth = columnWidths.reduce((a, b) => a + b, 0);
  
  // Dibujar cabecera
  doc.rect(x, currentY, tableWidth, rowHeight).fill(headerColor);
  let currentX = x;
  headers.forEach((header, index) => {
    doc.fillColor(headerTextColor).fontSize(10).font("Helvetica-Bold");
    doc.text(header, currentX + 5, currentY + 8, {
      width: columnWidths[index] - 10,
      align: "center"
    });
    currentX += columnWidths[index];
  });

  currentY += rowHeight;

  // Dibujar filas de datos
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

  // Borde exterior de la tabla
  doc.rect(x, y, tableWidth, currentY - y).stroke(borderColor);

  return currentY;
}


exports.generarReporteClientesPorDia = async (req, res) => {
  try {
    const { gym_id, rol, id } = req.usuario;
    const gymObjectId = new mongoose.Types.ObjectId(gym_id);

    // --- 1. OBTENER DATOS ---
    const matchQuery = {
      gym: gymObjectId,
    };

    if (rol === "trabajador") {
      matchQuery.creadorId = new mongoose.Types.ObjectId(id);
    }

    // Día actual
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Resumen de pagos del día (sumando montos y contando clientes)
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

    // Datos de la semana (sumando montos)
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

    // --- 2. PROCESAR DATOS PARA EL PDF ---

    // Formatear resumen de pagos del día
    const resumenHoyProcesado = {
      Yape: { total: 0, count: 0 },
      Plin: { total: 0, count: 0 },
      Efectivo: { total: 0, count: 0 },
    };
    let totalHoy = 0;
    let totalClientesHoy = 0;

    resumenPagosHoy.forEach((item) => {
      if (resumenHoyProcesado.hasOwnProperty(item._id)) {
        resumenHoyProcesado[item._id].total = item.total;
        resumenHoyProcesado[item._id].count = item.count;
      }
      totalHoy += item.total;
      totalClientesHoy += item.count;
    });

    // Formatear ingresos de la semana
    const ingresosSemanaProcesado = Array(7).fill(0);
    ingresosSemana.forEach((item) => {
      ingresosSemanaProcesado[item._id - 1] = item.total;
    });

    const ingresosSemanaLunesPrimero = ingresosSemanaProcesado.slice(1);
    let totalSemana = ingresosSemanaProcesado.reduce((a, b) => a + b, 0);

    // --- 3. GENERAR PDF ---

    const doc = new PDFDocument({ margin: 40, size: "A4" });
    const reportesDir = path.join(__dirname, "../Reportes");
    if (!fs.existsSync(reportesDir)) {
      fs.mkdirSync(reportesDir, { recursive: true });
    }
    const filePath = path.join(
      reportesDir,
      `reporte_clientes_${Date.now()}.pdf`
    );
    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);

    const pageWidth = doc.page.width;

    // Título
    doc
      .fontSize(18)
      .font("Helvetica-Bold")
      .text("REPORTE DE INGRESOS DIARIOS", { align: "center" });
    doc.moveDown();

    // Fecha y generado por
    const fechaActual = new Date().toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    doc.fontSize(10).font("Helvetica").text(`Fecha: ${fechaActual}`, {
      align: "right",
    });

    let generadoPorText = "Sistema";
    if (rol === 'admin') {
        generadoPorText = "Administrador";
    } else if (rol === 'trabajador') {
        const trabajador = await Trabajador.findById(id);
        const nombreTrabajador = trabajador ? trabajador.nombre : 'Desconocido';
        generadoPorText = `Trabajador: ${nombreTrabajador}`;
    }

    doc
      .fontSize(10)
      .font("Helvetica-Oblique")
      .text(`Generado por: ${generadoPorText}`, {
        align: "right",
      });
    doc.moveDown(2);

    let currentY = doc.y;
    const tableWidth = 515; // Ancho ajustado a los márgenes
    const tableStartX = (pageWidth - tableWidth) / 2;

    // --- TABLA PRINCIPAL DEL DIA ---
    doc
      .fontSize(12)
      .font("Helvetica-Bold")
      .text(
        "Resumen de Ingresos del Día",
        tableStartX,
        currentY,
        { align: "left" }
      );
    currentY += 25;

    const headersPagos = ["Método de Pago", "Nº Clientes", "Total Ingresos"];
    const columnWidthsPagos = [215, 150, 150];

    const datosPagos = [
      ["Yape", resumenHoyProcesado.Yape.count, resumenHoyProcesado.Yape.total],
      ["Plin", resumenHoyProcesado.Plin.count, resumenHoyProcesado.Plin.total],
      [
        "Efectivo",
        resumenHoyProcesado.Efectivo.count,
        resumenHoyProcesado.Efectivo.total,
      ],
      ["TOTAL GENERAL", totalClientesHoy, totalHoy],
    ];

    currentY = drawTable(
      doc,
      tableStartX,
      currentY,
      headersPagos,
      datosPagos,
      columnWidthsPagos
    );
    currentY += 30;

    // --- TABLA SEMANAL ---
    doc
      .fontSize(12)
      .font("Helvetica-Bold")
      .text(
        "Resumen de Ingresos de la Semana",
        tableStartX,
        currentY,
        { align: "left" }
      );
    currentY += 30;

    const diasSemanaLunesPrimero = [
      "LUNES",
      "MARTES",
      "MIÉRCOLES",
      "JUEVES",
      "VIERNES",
      "SÁBADO",
    ];
    const headersSemanal = [...diasSemanaLunesPrimero, "Total Semanal"];
    const columnWidthsSemanal = [65, 65, 70, 65, 65, 65, 125];

    const ingresosSemanalSeguros = ingresosSemanaLunesPrimero.map(
      (valor) => valor || 0
    );
    const datosSemanal = [ingresosSemanalSeguros.concat([totalSemana])];

    currentY = drawTable(
      doc,
      tableStartX,
      currentY,
      headersSemanal,
      datosSemanal,
      columnWidthsSemanal
    );

    doc.end();

    stream.on("finish", () => {
      res.download(filePath, (err) => {
        if (err) {
          console.error("Error al descargar el archivo:", err);
        }
        fs.unlink(filePath, (unlinkErr) => {
          if (unlinkErr) {
            console.error(
              "Error al eliminar el archivo del reporte:",
              unlinkErr
            );
          }
        });
      });
    });
  } catch (err) {
    console.error("Error en generarReporteClientesPorDia:", err);
    res.status(500).json({ error: "Error al generar el reporte PDF." });
  }
};