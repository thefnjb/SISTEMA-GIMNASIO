const PDFDocument = require("pdfkit");
const ClientesPorDia = require("../Modelos/ClientesporDia");
const Miembro = require("../Modelos/Miembro");
const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");

exports.generarReporteMensual = async (req, res) => {
  try {
    const añoActual = req.query.year ? parseInt(req.query.year, 10) : new Date().getFullYear();

    // === Clientes por día ===
    const ingresosPorDia = await ClientesPorDia.aggregate([
      {
        $match: {
          fecha: {
            $gte: new Date(`${añoActual}-01-01`),
            $lte: new Date(`${añoActual}-12-31`),
          },
        },
      },
      {
        $group: {
          _id: { $month: "$fecha" },
          total: { $sum: "$monto" },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // === Clientes por membresía ===
    const ingresosPorMembresia = await Miembro.aggregate([
      {
        $match: {
          fechaIngreso: {
            $gte: new Date(`${añoActual}-01-01`),
            $lte: new Date(`${añoActual}-12-31`),
          },
        },
      },
      {
        $lookup: {
          from: "membresias", // Nombre de la colección de membresías
          localField: "mensualidad",
          foreignField: "_id",
          as: "membresiaInfo",
        },
      },
      {
        $unwind: "$membresiaInfo",
      },
      {
        $group: {
          _id: { $month: "$fechaIngreso" },
          total: { $sum: "$membresiaInfo.precio" },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const mesesNombres = [
      "ENERO","FEBRERO","MARZO","ABRIL","MAYO","JUNIO",
      "JULIO","AGOSTO","SEPTIEMBRE","OCTUBRE","NOVIEMBRE","DICIEMBRE"
    ];

    // Mapear datos clientes por día
    const dataClientesDia = mesesNombres.map((mes, i) => {
      const encontrado = ingresosPorDia.find((item) => item._id === i + 1);
      return { mes, total: encontrado ? encontrado.total : 0 };
    });

    // Mapear datos clientes por membresía
    const dataMembresias = mesesNombres.map((mes, i) => {
      const encontrado = ingresosPorMembresia.find((item) => item._id === i + 1);
      return { mes, total: encontrado ? encontrado.total : 0 };
    });

    const totalDia = dataClientesDia.reduce((a, b) => a + b.total, 0);
    const totalMembresia = dataMembresias.reduce((a, b) => a + b.total, 0);

    // === PDF ===
    const doc = new PDFDocument({ margin: 40, size: "A4" });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=reporte_mensual.pdf"
    );

    doc.pipe(res);

    const headerColor = "#852b33";

    // ===== Encabezado general =====
    doc.rect(0, 0, doc.page.width, 100).fill(headerColor);

    // Logo circular
    const logoPath = path.join(__dirname, '..', 'gimnasio-frontend', 'public', 'images', 'logo.jpg');
    const logoSize = 80;
    const logoX = 50;
    const logoY = 10;

    doc.save();
    doc.circle(logoX + logoSize / 2, logoY + logoSize / 2, logoSize / 2).clip();
    doc.image(logoPath, logoX, logoY, { width: logoSize, height: logoSize });
    doc.restore();

    // Borde del logo
    doc.circle(logoX + logoSize / 2, logoY + logoSize / 2, logoSize / 2)
       .lineWidth(2)
       .strokeColor("#fff")
       .stroke();

    // Título centrado
    doc.fillColor("#FFFFFF")
       .fontSize(12)
       .font("Helvetica-Bold")
       .text("REPORTE MENSUAL - GIMNASIO TERRONES", 0, 40, { align: "center" });

    // Fecha arriba a la derecha
    doc.fontSize(10)
       .font("Helvetica")
       .fillColor("#FFFFFF")
       .text(`FECHA: ${new Date().toLocaleDateString("es-PE")}`, 0, 20, { align: "right" });

    doc.moveDown(3);

    // ===== Sección Clientes por Día =====
    let y = 150;
    doc.fillColor("#000000").fontSize(12).font("Helvetica-Bold")
       .text("CLIENTES POR DÍA", 70, y);

    y += 30;

    // Fondo del encabezado de tabla
    doc.rect(60, y, 490, 30).fill(headerColor); 
    doc.fillColor("#FFFFFF").fontSize(12).font("Helvetica-Bold"); 
    doc.text("AÑO", 70, y + 9);
    doc.text("MESES", 170, y + 9); 
    doc.text("INGRESOS", 400, y + 9); 

    y += 35;
    doc.fillColor("#000000").fontSize(12).font("Helvetica");

    let startY = y; // To align the year with the first month
    dataClientesDia.forEach((item, index) => {
      if (index === 0) {
          doc.text(añoActual.toString(), 70, startY);
      }
      doc.text(item.mes, 170, y);
      doc.text(`S/ ${item.total.toFixed(2)}`, 400, y);
      y += 25; 
    });

    y += 10;
    doc.rect(60, y - 5, 490, 30).fill(headerColor); 
    doc.fillColor("#FFFFFF").fontSize(12).font("Helvetica-Bold");
    doc.text("TOTAL", 170, y + 2);
    doc.text(`S/ ${totalDia.toFixed(2)}`, 400, y + 2);

    // ===== Sección Membresías =====
    doc.addPage();
    y = 100;

    doc.fillColor("#000000").fontSize(12).font("Helvetica-Bold")
        .text("CLIENTES POR MENSUALIDAD", 70, y);

    y += 30;

    // Fondo del encabezado de tabla
    doc.rect(60, y, 490, 25).fill(headerColor);
    doc.fillColor("#FFFFFF").fontSize(11).font("Helvetica-Bold");
    doc.text("AÑO", 70, y + 9);
    doc.text("MESES", 170, y + 9);
    doc.text("INGRESOS", 400, y + 9);

    y += 35;
    doc.fillColor("#000000").fontSize(11).font("Helvetica");

    let startYMembresia = y; // Guardar la posición inicial para el año

    dataMembresias.forEach((item, index) => {
      if (index === 0) {
          doc.text(añoActual.toString(), 70, startYMembresia); // El año en la primera fila
      }
      doc.text(item.mes, 170, y);
      doc.text(`S/ ${item.total.toFixed(2)}`, 400, y);
      y += 20;
    });

    y += 10;
    doc.rect(60, y - 5, 490, 30).fill(headerColor); 
    doc.fillColor("#FFFFFF").fontSize(12).font("Helvetica-Bold");
    doc.text("TOTAL", 170, y + 2);
    doc.text(`S/ ${totalMembresia.toFixed(2)}`, 400, y + 2);

    doc.end();

  } catch (err) {
    console.error("Error en generarReporteMensual:", err);
    res.status(500).json({ error: "Error al generar el reporte mensual PDF." });
  }
};