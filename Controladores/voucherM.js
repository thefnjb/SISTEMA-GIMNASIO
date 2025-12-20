const PDFDocument = require("pdfkit");
const Miembro = require("../Modelos/Miembro");
const Trabajador = require("../Modelos/Trabajador");
const Gym = require("../Modelos/Gimnasio");

const generarVoucherMiembro = async (req, res) => {
  try {
    const { rol, id, gym_id } = req.usuario;
    const { miembroId } = req.params;

    const miembro = await Miembro.findById(miembroId)
      .populate("mensualidad")
      .populate({ path: "historialMembresias.membresiaId" });

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
      year: "numeric",
      month: "long",
      day: "numeric"
    });
    const horaActual = new Date().toLocaleTimeString("es-PE", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true
    });

    const doc = new PDFDocument({
      size: [210, 350],
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

    // Obtener nombre de la empresa
    const gym = await Gym.findById(gym_id).select('nombreEmpresa');
    const nombreEmpresa = gym?.nombreEmpresa || "GYM TERRONES";

    // Fondo y borde
    doc.rect(0, 0, doc.page.width, doc.page.height).fill("#ffffff");
    doc.strokeColor("#cccccc").lineWidth(1).rect(10, 10, doc.page.width - 20, doc.page.height - 20).stroke();

    // Encabezado
    doc.fontSize(14).fillColor("#d32f2f").text(nombreEmpresa.toUpperCase(), { align: "center" });
    doc.moveDown(0.3);
    doc.strokeColor("#bbbbbb").moveTo(20, doc.y).lineTo(doc.page.width - 20, doc.y).stroke();
    doc.moveDown(0.5);

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

    // Datos del cliente
    drawBox("Cliente", miembro.nombreCompleto);
    drawBox("Teléfono", miembro.telefono);
    drawBox("Fecha ingreso", miembro.fechaIngreso ? new Date(miembro.fechaIngreso).toLocaleDateString("es-ES") : "-");
    drawBox("Método de pago", miembro.metodoPago || "-");

    const montoPagado = typeof miembro.pago === "number" ? miembro.pago : (miembro.mensualidad?.precio || 0);
    if (!montoPagado || montoPagado === 0) {
      drawBox("Pago", "No registrado");
    } else {
      drawBox("Pago", `S/ ${montoPagado.toFixed(2)}`);
    }

    drawBox("Debe", `S/ ${Number(miembro.debe || 0).toFixed(2)}`);
    drawBox("Estado", miembro.estado);
    drawBox("Vencimiento", miembro.vencimiento ? new Date(miembro.vencimiento).toLocaleDateString("es-ES") : "No aplica");

    // Historial y membresías
    const historial = Array.isArray(miembro.historialMembresias) ? miembro.historialMembresias.slice() : [];
    historial.sort((a, b) => new Date(a.fechaRenovacion) - new Date(b.fechaRenovacion));

    const currentMembership = miembro.mensualidad || (historial.length ? historial[historial.length - 1].membresiaId : null);

    const drawMembershipDetails = (title, obj, extra) => {
      if (!obj) return;
      doc.moveDown(0.2);
      doc.fontSize(11).fillColor("#d32f2f").text(title, { align: "left", indent: infoX });
      doc.moveDown(0.15);
      doc.fontSize(10).fillColor(labelColor);

      const precio = (obj.precio !== undefined) ? obj.precio : (extra && extra.precio) || 0;
      const duracion = obj.duracion !== undefined ? obj.duracion : (extra && extra.mesesAgregados) || "-";
      const turno = obj.turno || "-";
      const fecha = extra && extra.fechaRenovacion ? new Date(extra.fechaRenovacion).toLocaleDateString("es-ES") : "-";

      doc.text(`Duración: ${duracion} ${duracion === 1 ? "mes" : "meses"}`, infoX);
      doc.text(`Precio: S/ ${Number(precio || 0).toFixed(2)}`, infoX);
      doc.text(`Turno: ${turno}`, infoX);
      if (fecha && fecha !== "-") doc.text(`Fecha renovación: ${fecha}`, infoX);
      doc.moveDown(0.3);
    };

    // Mostrar membresía actual
    if (currentMembership) {
      drawMembershipDetails("Membresía actual", currentMembership);
    }

    // Mostrar membresía anterior solo si realmente existe una anterior
    if (historial.length >= 2) {
      const prev = historial[historial.length - 2];
      drawMembershipDetails("Membresía anterior", prev.membresiaId || {}, prev);
    }

    doc.moveDown(0.4);
    doc.strokeColor("#bbbbbb").moveTo(20, doc.y).lineTo(doc.page.width - 20, doc.y).stroke();

    doc.moveDown(0.2);
    doc.fontSize(9).fillColor("#333").text(`Generado por: ${generadoPor}`, { align: "center" });
    doc.text(`${fechaActual} - ${horaActual}`, { align: "center" });

    doc.end();
  } catch (error) {
    console.error("Error al generar voucher:", error);
    res.status(500).json({ message: "Error al generar voucher PDF" });
  }
};

module.exports = { generarVoucherMiembro };
