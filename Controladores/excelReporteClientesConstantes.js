const ExcelJS = require("exceljs");
const ClientesPorDia = require("../Modelos/ClientesporDia");
const Trabajador = require("../Modelos/Trabajador");

// Función para agrupar clientes por nombre y documento
function agruparClientes(clientes) {
  const grupos = {};
  
  clientes.forEach((cliente) => {
    const clave = cliente.numeroDocumento 
      ? `${cliente.nombre.toLowerCase().trim()}_${cliente.tipoDocumento}_${cliente.numeroDocumento.trim()}`
      : `${cliente.nombre.toLowerCase().trim()}_sin_doc`;
    
    if (!grupos[clave]) {
      grupos[clave] = {
        nombre: cliente.nombre,
        tipoDocumento: cliente.tipoDocumento || "DNI",
        numeroDocumento: cliente.numeroDocumento || "-",
        visitas: [],
        totalVisitas: 0,
        totalMonto: 0,
        metodosPago: new Set(),
        ultimaVisita: null
      };
    }
    
    grupos[clave].visitas.push(cliente);
    grupos[clave].totalVisitas++;
    grupos[clave].totalMonto += cliente.monto || 7;
    
    if (cliente.metododePago) {
      grupos[clave].metodosPago.add(cliente.metododePago);
    }
    
    // Actualizar última visita
    if (!grupos[clave].ultimaVisita || 
        new Date(cliente.fecha || cliente.createdAt) > new Date(grupos[clave].ultimaVisita.fecha || grupos[clave].ultimaVisita.createdAt)) {
      grupos[clave].ultimaVisita = cliente;
    }
  });
  
  // Ordenar visitas por fecha (más reciente primero)
  Object.values(grupos).forEach((grupo) => {
    grupo.visitas.sort((a, b) => {
      const fechaA = new Date(a.fecha || a.createdAt || 0);
      const fechaB = new Date(b.fecha || b.createdAt || 0);
      return fechaB - fechaA;
    });
  });
  
  return Object.values(grupos).sort((a, b) => {
    const fechaA = a.ultimaVisita?.fecha || new Date(0);
    const fechaB = b.ultimaVisita?.fecha || new Date(0);
    return fechaB - fechaA;
  });
}

// Generar Excel
exports.generarReporteClientesConstantesExcel = async (req, res) => {
  try {
    const { rol, id } = req.usuario;

    // Obtener todos los clientes
    const clientesDocs = await ClientesPorDia.find({})
      .sort({ fecha: -1, createdAt: -1 })
      .lean();

    // Agregar nombre del creador
    const clientes = await Promise.all(
      clientesDocs.map(async (cliente) => {
        if (cliente.creadoPor === "admin") {
          cliente.creadorNombre = "Administrador";
        } else if (cliente.creadoPor === "trabajador" && cliente.creadorId) {
          const trabajador = await Trabajador.findById(cliente.creadorId).select("nombre").lean();
          cliente.creadorNombre = trabajador ? trabajador.nombre : "Trabajador desconocido";
        } else {
          cliente.creadorNombre = "Desconocido";
        }
        return cliente;
      })
    );

    // Agrupar clientes
    const grupos = agruparClientes(clientes);

    // Crear workbook de Excel
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Clientes Constantes");

    // Estilo de encabezado
    const headerStyle = {
      font: { bold: true, color: { argb: 'FFFFFFFF' }, size: 11 },
      fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF852B33' } },
      alignment: { horizontal: 'center', vertical: 'middle' },
      border: {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      }
    };

    // Encabezado del reporte
    worksheet.mergeCells('A1:G1');
    const titleCell = worksheet.getCell('A1');
    titleCell.value = 'REPORTE DE CLIENTES CONSTANTES - GIMNASIO TERRONES';
    titleCell.font = { bold: true, size: 14, color: { argb: 'FF852B33' } };
    titleCell.alignment = { horizontal: 'center', vertical: 'middle' };

    worksheet.mergeCells('A2:G2');
    const fechaCell = worksheet.getCell('A2');
    fechaCell.value = `Fecha: ${new Date().toLocaleDateString("es-ES", { year: "numeric", month: "long", day: "numeric" })}`;
    fechaCell.font = { size: 10 };
    fechaCell.alignment = { horizontal: 'center' };

    let generadoPorText = "Administrador";
    if (rol === "trabajador") {
      const trabajador = await Trabajador.findById(id);
      generadoPorText = trabajador ? trabajador.nombre : "Trabajador";
    }
    worksheet.mergeCells('A3:G3');
    const generadoCell = worksheet.getCell('A3');
    generadoCell.value = `Generado por: ${generadoPorText}`;
    generadoCell.font = { size: 10, italic: true };
    generadoCell.alignment = { horizontal: 'center' };

    // Estadísticas
    worksheet.mergeCells('A4:G4');
    const statsCell = worksheet.getCell('A4');
    statsCell.value = `Total Clientes Únicos: ${grupos.length} | Total Visitas: ${clientes.length} | Total Recaudado: S/ ${grupos.reduce((sum, g) => sum + g.totalMonto, 0).toFixed(2)}`;
    statsCell.font = { bold: true, size: 10 };
    statsCell.alignment = { horizontal: 'center' };

    // Encabezados de tabla
    const headers = ['N°', 'Nombre', 'Documento', 'Visitas', 'Última Visita', 'Total Gastado', 'Métodos de Pago'];
    const headerRow = worksheet.getRow(5);
    headers.forEach((header, index) => {
      const cell = headerRow.getCell(index + 1);
      cell.value = header;
      Object.assign(cell, headerStyle);
    });
    headerRow.height = 25;

    // Datos
    grupos.forEach((grupo, index) => {
      const row = worksheet.addRow([
        index + 1,
        grupo.nombre || "Sin nombre",
        `${grupo.tipoDocumento || "DNI"}: ${grupo.numeroDocumento || "-"}`,
        grupo.totalVisitas,
        grupo.ultimaVisita?.fecha 
          ? new Date(grupo.ultimaVisita.fecha).toLocaleDateString("es-PE")
          : "-",
        grupo.totalMonto.toFixed(2),
        Array.from(grupo.metodosPago).join(", ") || "-"
      ]);

      row.eachCell((cell, colNumber) => {
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        };
        if (colNumber === 6) { // Columna de Total Gastado
          cell.numFmt = '"S/ "#,##0.00';
        }
      });

      // Filas alternas
      if (index % 2 === 0) {
        row.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFE5E7EB' }
        };
      }
    });

    // Ajustar ancho de columnas
    worksheet.columns = [
      { width: 8 },   // N°
      { width: 25 },  // Nombre
      { width: 20 },  // Documento
      { width: 10 },  // Visitas
      { width: 15 },  // Última Visita
      { width: 15 },  // Total Gastado
      { width: 30 }   // Métodos de Pago
    ];

    // Configurar respuesta
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=reporte_clientes_constantes.xlsx"
    );

    await workbook.xlsx.write(res);
    res.end();

  } catch (err) {
    console.error("Error en generarReporteClientesConstantesExcel:", err);
    res.status(500).json({ error: "Error al generar el reporte Excel." });
  }
};

