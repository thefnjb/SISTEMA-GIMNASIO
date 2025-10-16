const PDFDocument = require("pdfkit");
const ClientesPorDia = require("../Modelos/ClientesporDia");
const Trabajador = require("../Modelos/Trabajador");

const generadoVoucherDIA = async (req, res) => {
  try {
    const { rol, id } = req.usuario;
    const clienteId = req.params.miembroId || req.params.clienteId || req.params.id;

    const cliente = await ClientesPorDia.findById(clienteId);
    if (!cliente) {
      return res.status(404).json({ message: "Cliente por día no encontrado" });
    }

    let generadoPor = "Sistema";
    if (rol === "admin") generadoPor = "Administrador";
    if (rol === "trabajador") {
      const trabajador = await Trabajador.findById(id);
      generadoPor = trabajador ? trabajador.nombre : "Trabajador desconocido";
    }

    const fechaActual = new Date().toLocaleDateString("es-PE", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    const horaActual = new Date().toLocaleTimeString("es-PE", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });

    function formatTimeTo12Hour(time) {
      if (!time && time !== 0) return "";
      let str = String(time).trim();
      str = str.replace(",", ".");
      let parts = [];
      if (str.includes(":")) parts = str.split(":");
      else if (str.includes(".")) parts = str.split(".");
      else {
        const num = parseInt(str, 10);
        if (isNaN(num)) return str;
        const hours = Math.floor(num / 100);
        const minutes = num % 100;
        parts = [String(hours), String(minutes)];
      }
      let hours = parseInt(parts[0], 10);
      let minutes = parts[1] ? parseInt(parts[1].slice(0, 2), 10) : 0;
      const period = hours >= 12 ? "PM" : "AM";
      const hour12 = ((hours + 11) % 12) + 1;
      return `${hour12}:${String(minutes).padStart(2, "0")} ${period}`;
    }

    const horaIngresoFormateada = formatTimeTo12Hour(cliente.horaInicio);

    // Nombre limpio para el archivo
    const nombreLimpio = (cliente.nombre || "cliente").replace(/\s+/g, "_").replace(/[^\w\-]/g, "");

    // Encabezados de descarga inmediata
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename=voucher_${nombreLimpio}.pdf`);

    // Crear documento PDF y canalizarlo directo al response
    const doc = new PDFDocument({ size: [210, 350], margin: 15 });
    doc.pipe(res);

    // Fondo blanco y borde
    doc.rect(0, 0, doc.page.width, doc.page.height).fill("#ffffff");
    doc.strokeColor("#cccccc").lineWidth(1).rect(10, 10, doc.page.width - 20, doc.page.height - 20).stroke();

    // Encabezado centrado
    doc.fontSize(14).fillColor("#d32f2f").text("GYM TERRONES", { align: "center" });

    doc.moveDown(0.3);
    doc.strokeColor("#bbbbbb").moveTo(20, doc.y).lineTo(doc.page.width - 20, doc.y).stroke();
    doc.moveDown(0.5);

    // Contenido del voucher (estilo similar a voucherM)
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

    drawBox("Cliente", cliente.nombre || "-");
    drawBox("Fecha", cliente.fecha ? new Date(cliente.fecha).toLocaleDateString("es-ES") : "-");
    drawBox("Hora ingreso", horaIngresoFormateada || "-");
    drawBox("Método de pago", cliente.metododePago || cliente.metodoPago || "-");
    drawBox("Monto", cliente.monto ? `S/ ${cliente.monto.toFixed(2)}` : "S/ 0.00");

    doc.moveDown(0.4);
    doc.strokeColor("#bbbbbb").moveTo(20, doc.y).lineTo(doc.page.width - 20, doc.y).stroke();

    // Pie de página centrado
    doc.moveDown(5);
    doc.fontSize(9).fillColor("#333").text(`Generado por: ${generadoPor}`, { align: "center" });
    doc.text(`${fechaActual} - ${horaActual}`, { align: "center" });
    doc.text("¡Gracias por tu visita!", { align: "center" });

    doc.end(); // finaliza y envia
  } catch (error) {
    console.error("Error al generar voucher de cliente por día:", error);
    res.status(500).json({ message: "Error al generar voucher PDF" });
  }
};

module.exports = { generadoVoucherDIA };
