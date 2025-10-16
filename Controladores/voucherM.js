const PDFDocument = require("pdfkit");
const Miembro = require("../Modelos/Miembro");
const Trabajador = require("../Modelos/Trabajador");

const generarVoucherMiembro = async (req, res) => {
  try {
    const { rol, id } = req.usuario;
    const { miembroId } = req.params;

    const miembro = await Miembro.findById(miembroId).populate("mensualidad");
    if (!miembro) {
      return res.status(404).json({ message: "Cliente no encontrado" });
    }

    let generadoPor = "Sistema";
    if (rol === "admin") generadoPor = "Administrador";
    if (rol === "trabajador") {
      const trabajador = await Trabajador.findById(id);
      generadoPor = trabajador ? trabajador.nombre : "Trabajador desconocido";
    }

    const fechaActual = new Date().toLocaleDateString("es-PE", {
      year: "numeric", month: "long", day: "numeric"
    });
    const horaActual = new Date().toLocaleTimeString("es-PE", {
      hour: "numeric", minute: "2-digit", hour12: true
    });

    // Crear documento con tamaño de voucher pequeño
    const doc = new PDFDocument({
      size: [210, 350], // tamaño tipo voucher pequeño
      margin: 15
    });

    const buffers = [];
    doc.on("data", buffers.push.bind(buffers));
    doc.on("end", () => {
      const pdfData = Buffer.concat(buffers);
      const nombreLimpio = miembro.nombreCompleto.replace(/\s+/g, "_").replace(/[^\w\-]/g, "");
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", `attachment; filename=voucher_${nombreLimpio}.pdf`);
      res.send(pdfData);
    });

    // Fondo blanco y borde
    doc.rect(0, 0, doc.page.width, doc.page.height).fill("#ffffff");
    doc.strokeColor("#cccccc").lineWidth(1).rect(10, 10, doc.page.width - 20, doc.page.height - 20).stroke();

    // Encabezado centrado
    doc.fontSize(14).fillColor("#d32f2f").text("GYM TERRONES", {
      align: "center"
    });

    doc.moveDown(0.3);
    doc.strokeColor("#bbbbbb").moveTo(20, doc.y).lineTo(doc.page.width - 20, doc.y).stroke();
    doc.moveDown(0.5);

    // Contenido del voucher
    const infoX = 25;
    const labelColor = "#333333";
    const boxColor = "#f9f9f9";

    const drawBox = (label, value) => {
      doc.save();
      doc.roundedRect(infoX - 5, doc.y - 2, doc.page.width - 50, 18, 3).fill(boxColor);
      doc.fillColor(labelColor).fontSize(10);
      doc.text(`${label}: ${value}`, infoX, doc.y - 1);
      doc.moveDown(0.6);
      doc.restore();
    };

    drawBox("Cliente", miembro.nombreCompleto);
    drawBox("Teléfono", miembro.telefono);
    drawBox("Fecha ingreso", new Date(miembro.fechaIngreso).toLocaleDateString("es-ES"));
    drawBox("Tipo", miembro.mensualidad ? "Mensualidad" : "Por día");
    drawBox("Método de pago", miembro.metodoPago);
    drawBox("Estado de pago", miembro.estadoPago);
    drawBox("Debe", `S/ ${miembro.debe.toFixed(2)}`);
    drawBox("Vencimiento", miembro.vencimiento ? new Date(miembro.vencimiento).toLocaleDateString("es-ES") : "No aplica");

    doc.moveDown(0.4);
    doc.strokeColor("#bbbbbb").moveTo(20, doc.y).lineTo(doc.page.width - 20, doc.y).stroke();

    // Pie de página centrado
    doc.moveDown(5);
    doc.fontSize(9).fillColor("#333").text(`Generado por: ${generadoPor}`, { align: "center" });
    doc.text(`${fechaActual} - ${horaActual}`, { align: "center" });
    doc.text("¡Gracias por tu preferencia!", { align: "center" });

    doc.end();
  } catch (error) {
    console.error("Error al generar voucher:", error);
    res.status(500).json({ message: "Error al generar voucher PDF" });
  }
};

module.exports = { generarVoucherMiembro };
