const puppeteer = require("puppeteer");
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
        generadoPor = trabajador ? `${trabajador.nombre}` : "Trabajador desconocido";
    }

    const fechaActual = new Date().toLocaleDateString("es-PE", {
        year: "numeric", month: "long", day: "numeric"
    });
    const horaActual = new Date().toLocaleTimeString("es-PE", {
        hour: "numeric", minute: "2-digit", hour12: true
    });

    const html = `
        <html>
        <head>
            <style>
            body { 
                font-family: 'Arial', sans-serif; 
                font-size: 13px; 
                margin: 0; 
                height: 100vh;
                display: flex; 
                justify-content: center; 
                align-items: center; 
                background: #f5f5f5;
            }
            .voucher { 
                width: 280px; 
                background: #fff;
                border: 1px solid #ccc; 
                padding: 15px; 
                border-radius: 8px; 
                box-shadow: 0 2px 6px rgba(0,0,0,0.2);
            }
            .header { text-align: center; margin-bottom: 10px; }
            .header h1 { margin: 0; font-size: 16px; color: #d32f2f; }
            .info { margin: 6px 0; }
            .label { font-weight: bold; color: #333; }
            .box { background: #f9f9f9; padding: 6px; border-radius: 4px; margin-bottom: 4px; }
            .footer { margin-top: 12px; text-align: center; font-size: 11px; color: #444; }
            .divider { border-top: 1px dashed #bbb; margin: 10px 0; }
            </style>
        </head>
        <body>
            <div class="voucher">
            <div class="header">
                <h1>GYM TERRONES</h1>
                <div class="divider"></div>
            </div>

            <div class="box"><span class="label">Cliente:</span> ${miembro.nombreCompleto}</div>
            <div class="box"><span class="label">Teléfono:</span> ${miembro.telefono}</div>
            <div class="box"><span class="label">Fecha ingreso:</span> ${new Date(miembro.fechaIngreso).toLocaleDateString("es-ES")}</div>
            <div class="box"><span class="label">Tipo:</span> ${miembro.mensualidad ? "Mensualidad" : "Por día"}</div>
            <div class="box"><span class="label">Método de pago:</span> ${miembro.metodoPago}</div>
            <div class="box"><span class="label">Estado de pago:</span> ${miembro.estadoPago}</div>
            <div class="box"><span class="label">Debe:</span> S/ ${miembro.debe.toFixed(2)}</div>
            <div class="box"><span class="label">Vencimiento:</span> ${miembro.vencimiento ? new Date(miembro.vencimiento).toLocaleDateString("es-ES") : "No aplica"}</div>

            <div class="divider"></div>

            <div class="footer">
                <p>Generado por: ${generadoPor}</p>
                <p>${fechaActual} - ${horaActual}</p>
                <p><b>¡Gracias por tu preferencia!</b></p>
            </div>
            </div>
        </body>
        </html>
    `;

    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle0" });

    const pdfBuffer = await page.pdf({ format: "A6", printBackground: true });
    await browser.close();

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename=voucher_${miembro.nombreCompleto}.pdf`);
    res.send(pdfBuffer);
    } catch (error) {
    console.error("Error al generar voucher:", error);
    res.status(500).json({ message: "Error al generar voucher PDF" });
    }
};

module.exports = { generarVoucherMiembro };
