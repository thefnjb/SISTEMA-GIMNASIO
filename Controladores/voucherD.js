const puppeteer = require("puppeteer");
const ClientesPorDia = require("../Modelos/ClientesporDia");
const Trabajador = require("../Modelos/Trabajador");

const generadoVoucherDIA = async (req, res) => {
    try {
    const { rol, id } = req.usuario;
    // Aceptar tanto miembroId (ruta) como clienteId (posible variantes)
    const clienteId = req.params.miembroId || req.params.clienteId || req.params.id;

    // Buscar cliente por día
    const cliente = await ClientesPorDia.findById(clienteId);
    if (!cliente) {
        return res.status(404).json({ message: "Cliente por día no encontrado" });
    }

    // Quién generó el voucher
    let generadoPor = "Sistema";
    if (rol === "admin") generadoPor = "Administrador";
    if (rol === "trabajador") {
        const trabajador = await Trabajador.findById(id);
        generadoPor = trabajador ? ` ${trabajador.nombre}` : "Trabajador desconocido";
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
            .box { background: #f9f9f9; padding: 6px; border-radius: 4px; margin-bottom: 4px; }
            .label { font-weight: bold; color: #333; }
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

            <div class="box"><span class="label">Cliente:</span> ${cliente.nombre}</div>
            <div class="box"><span class="label">Fecha:</span> ${new Date(cliente.fecha).toLocaleDateString("es-ES")}</div>
            <div class="box"><span class="label">Hora Ingreso:</span> ${cliente.horaInicio}</div>
            <div class="box"><span class="label">Método de pago:</span> ${cliente.metododePago}</div>
            <div class="box"><span class="label">Monto:</span> S/ ${cliente.monto.toFixed(2)}</div>

            <div class="divider"></div>

            <div class="footer">
                <p>Generado por: ${generadoPor}</p>
                <p>${fechaActual} - ${horaActual}</p>
                <p><b>¡Gracias por tu visita!</b></p>
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

    // Nombre del archivo usando el cliente
    const nombreLimpio = cliente.nombre.replace(/\s+/g, "_").replace(/[^\w\-]/g, "");

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename=voucher_${nombreLimpio}.pdf`);
    res.send(pdfBuffer);
    } catch (error) {
    console.error("Error al generar voucher de cliente por día:", error);
    res.status(500).json({ message: "Error al generar voucher PDF" });
    }
};

module.exports = { generadoVoucherDIA };
