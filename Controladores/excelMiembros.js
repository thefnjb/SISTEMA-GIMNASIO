const ExcelJS = require("exceljs");
const Miembro = require("../Modelos/Miembro");
const Trabajador = require("../Modelos/Trabajador");

const generarExcelMiembros = async (req, res) => {
    try {
    // Traer miembros y popular referencias
    const miembrosRaw = await Miembro.find()
        .populate("mensualidad")
        .populate("entrenador")
        .lean();

    // Calcular creadorNombre para cada miembro (Administrador o nombre del trabajador)
    const miembros = await Promise.all(
      miembrosRaw.map(async (m) => {
        let creadorNombre = "Desconocido";
        try {
          if (m.creadorId) {
            if (m.creadoPor === "admin") {
              creadorNombre = "Administrador";
            } else if (m.creadoPor === "trabajador") {
              const creador = await Trabajador.findById(m.creadorId).select("nombre").lean();
              if (creador && creador.nombre) creadorNombre = creador.nombre;
            }
          }
        } catch (err) {
          // Si hay un error buscando el trabajador, dejamos 'Desconocido'
          console.error("Error obteniendo creadorNombre:", err);
        }

        return { ...m, creadorNombre };
      })
    );

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Miembros");

    // 🔹 Encabezados con estilo parecido a tu tabla
    worksheet.columns = [
        { header: "NOMBRE Y APELLIDO", key: "nombreCompleto", width: 40 },
        { header: "TELÉFONO", key: "telefono", width: 20 },
        { header: "INGRESO", key: "fechaIngreso", width: 15 },
        { header: "MENSUALIDAD", key: "mensualidad", width: 35 },
        { header: "ENTRENADOR", key: "entrenador", width: 40 },
        { header: "PAGO", key: "metodoPago", width: 15 },
        { header: "DEBE", key: "debe", width: 10 },
        { header: "VENCE", key: "vencimiento", width: 15 },
        { header: "ESTADO", key: "estado", width: 15 },
        { header: "CAMBIOS", key: "creadorNombre", width: 40 },
    ];

    // 🔹 Estilo encabezado (rojo → negro → blanco)
    const headerRow = worksheet.getRow(1);
    headerRow.eachCell((cell) => {
      cell.fill = {
        type: "gradient",
        gradient: "angle",
        degree: 0,
        stops: [
          { position: 0, color: { argb: "FF1A1A1A" } }, 
          { position: 1, color: { argb: "FF7A0F16" } }, 
        ],
      };
      cell.font = { bold: true, color: { argb: "FFFFFFFF" }, size: 11 };
      cell.alignment = { vertical: "middle", horizontal: "center" };
      cell.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      };
    });

    // Habilitar filtro para toda la fila de encabezados
    worksheet.autoFilter = {
      from: { row: 1, column: 1 },
      to: { row: 1, column: worksheet.columns.length },
    };
    
    // 🔹 Filas con estilo alternado (gris/blanco)
    miembros.forEach((m, index) => {
      const row = worksheet.addRow({
        nombreCompleto: m.nombreCompleto,
        telefono: m.telefono,
        fechaIngreso: m.fechaIngreso
          ? new Date(m.fechaIngreso).toLocaleDateString("es-PE")
          : "-",
        // Mostrar información útil de la mensualidad (duración, precio y turno)
        mensualidad: m.mensualidad
          ? `${m.mensualidad.duracion} meses - S/ ${Number(m.mensualidad.precio || 0).toFixed(2)} - ${m.mensualidad.turno || "-"}`
          : "N/A",
        entrenador: m.entrenador?.nombre || "-",
        metodoPago: m.metodoPago,
        debe: `S/ ${Number(m.debe || 0).toFixed(2)}`,
        vencimiento: m.vencimiento
          ? new Date(m.vencimiento).toLocaleDateString("es-PE")
          : "N/A",
        estado: m.estado,
  creadorNombre: m.creadorNombre || "Desconocido",
      });

      // Alternar colores de fila
      const fillColor = index % 2 === 0 ? "FFF3F4F6" : "FFFFFFFF"; // gris claro y blanco
      row.eachCell((cell) => {
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: fillColor },
        };
        cell.alignment = { vertical: "middle", horizontal: "center" };
        cell.border = {
          top: { style: "thin", color: { argb: "FFB0B0B0" } },
          left: { style: "thin", color: { argb: "FFB0B0B0" } },
          bottom: { style: "thin", color: { argb: "FFB0B0B0" } },
          right: { style: "thin", color: { argb: "FFB0B0B0" } },
        };
      });
    });

    // Ajustar altura de filas
    worksheet.eachRow((row) => {
      row.height = 20;
    });

    // Descargar Excel
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=miembros.xlsx"
    );

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error("Error al generar Excel:", error);
    res.status(500).json({ message: "Error al generar Excel de miembros" });
  }
};

module.exports = { generarExcelMiembros };
