const ExcelJS = require("exceljs");
const ClientesPorDia = require("../Modelos/ClientesporDia");
const Trabajador = require("../Modelos/Trabajador");

/**
 * Convierte hora de formato 24h a formato 12h (AM/PM)
 */
function formatHora12(hora24) {
  if (!hora24 || hora24 === "-") return "-";
  
  try {
    const [horas, minutos] = hora24.split(":");
    if (!horas || !minutos) return hora24;
    
    const h = parseInt(horas, 10);
    const m = minutos;
    
    if (isNaN(h) || h < 0 || h > 23) return hora24;
    
    const periodo = h >= 12 ? "PM" : "AM";
    const hora12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
    
    return `${hora12}:${m} ${periodo}`;
  } catch {
    return hora24;
  }
}

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
    worksheet.mergeCells('A1:E1');
    const titleCell = worksheet.getCell('A1');
    titleCell.value = 'REPORTE DE CLIENTES CONSTANTES - GIMNASIO TERRONES';
    titleCell.font = { bold: true, size: 14, color: { argb: 'FF852B33' } };
    titleCell.alignment = { horizontal: 'center', vertical: 'middle' };

    worksheet.mergeCells('A2:E2');
    const fechaCell = worksheet.getCell('A2');
    fechaCell.value = `Fecha: ${new Date().toLocaleDateString("es-ES", { year: "numeric", month: "long", day: "numeric" })}`;
    fechaCell.font = { size: 10 };
    fechaCell.alignment = { horizontal: 'center' };

    let generadoPorText = "Administrador";
    if (rol === "trabajador") {
      const trabajador = await Trabajador.findById(id);
      generadoPorText = trabajador ? trabajador.nombre : "Trabajador";
    }
    worksheet.mergeCells('A3:E3');
    const generadoCell = worksheet.getCell('A3');
    generadoCell.value = `Generado por: ${generadoPorText}`;
    generadoCell.font = { size: 10, italic: true };
    generadoCell.alignment = { horizontal: 'center' };

    // Estadísticas
    worksheet.mergeCells('A4:E4');
    const statsCell = worksheet.getCell('A4');
    statsCell.value = `Total Clientes Únicos: ${grupos.length} | Total Visitas: ${clientes.length} | Total Recaudado: S/ ${grupos.reduce((sum, g) => sum + g.totalMonto, 0).toFixed(2)}`;
    statsCell.font = { bold: true, size: 10 };
    statsCell.alignment = { horizontal: 'center' };

    // Encabezados de tabla
    const headers = ['N°', 'Nombre Cliente', 'Documento', 'Días Ingresados', 'Última Visita (Hora)'];
    const headerRow = worksheet.getRow(5);
    headers.forEach((header, index) => {
      const cell = headerRow.getCell(index + 1);
      cell.value = header;
      Object.assign(cell, headerStyle);
    });
    headerRow.height = 25;

    // Datos - mostrar resumen por cliente constante
    grupos.forEach((grupo, index) => {
      // Calcular días diferentes que ingresó
      const diasUnicos = new Set();
      let ultimaHora = null;
      let ultimaFecha = null;
      
      grupo.visitas.forEach((visita) => {
        const fecha = visita.fecha || visita.createdAt;
        if (fecha) {
          const fechaStr = new Date(fecha).toISOString().split('T')[0]; // YYYY-MM-DD
          diasUnicos.add(fechaStr);
          
          // Obtener la hora de la última visita
          const fechaVisita = new Date(fecha);
          const fechaUltima = ultimaFecha ? new Date(ultimaFecha) : null;
          
          if (!fechaUltima || fechaVisita > fechaUltima) {
            ultimaFecha = fecha;
            ultimaHora = visita.horaInicio || null;
          } else if (fechaVisita.getTime() === fechaUltima.getTime()) {
            // Si es el mismo día, tomar la hora más reciente
            const horaActual = visita.horaInicio || null;
            if (horaActual && (!ultimaHora || horaActual > ultimaHora)) {
              ultimaHora = horaActual;
            }
          }
        }
      });
      
      const documento = `${grupo.tipoDocumento || "DNI"}: ${grupo.numeroDocumento || "-"}`;
      const diasIngresados = diasUnicos.size;
      const horaFormato12 = formatHora12(ultimaHora);
      
      const row = worksheet.addRow([
        index + 1,
        grupo.nombre || "Sin nombre",
        documento,
        diasIngresados,
        horaFormato12
      ]);

      row.eachCell((cell, colNumber) => {
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        };
        if (colNumber === 4) { // Columna de Días Ingresados
          cell.font = { bold: true, color: { argb: 'FF852B33' } };
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
      { width: 30 },  // Nombre Cliente
      { width: 20 },  // Documento
      { width: 18 },  // Días Ingresados
      { width: 20 }   // Última Visita (Hora)
    ];

    // Agregar tablas detalladas solo para clientes constantes (más de 1 día de ingreso)
    const gruposConstantes = grupos.filter((grupo) => {
      const diasUnicos = new Set();
      grupo.visitas.forEach((visita) => {
        const fecha = visita.fecha || visita.createdAt;
        if (fecha) {
          const fechaStr = new Date(fecha).toISOString().split('T')[0];
          diasUnicos.add(fechaStr);
        }
      });
      return diasUnicos.size > 1; // Solo clientes con más de 1 día de ingreso
    });

    let currentRow = worksheet.rowCount + 3; // Espacio después de la tabla resumen
    
    gruposConstantes.forEach((grupo, index) => {
      // Espacio antes del título del cliente
      currentRow++;
      
      // Título del cliente
      worksheet.mergeCells(`A${currentRow}:E${currentRow}`);
      const clienteTitleCell = worksheet.getCell(`A${currentRow}`);
      clienteTitleCell.value = `${grupo.nombre} - ${grupo.tipoDocumento || "DNI"}: ${grupo.numeroDocumento || "-"}`;
      clienteTitleCell.font = { bold: true, size: 12, color: { argb: 'FF852B33' } };
      clienteTitleCell.alignment = { horizontal: 'left', vertical: 'middle' };
      worksheet.getRow(currentRow).height = 25; // Altura para el título
      currentRow++;
      
      // Espacio adicional entre título y tabla
      currentRow++;

      // Encabezados de tabla detallada
      const detailHeaders = ['N°', 'Fecha', 'Hora', 'Método de Pago', 'Monto'];
      const detailHeaderRow = worksheet.getRow(currentRow);
      detailHeaders.forEach((header, colIndex) => {
        const cell = detailHeaderRow.getCell(colIndex + 1);
        cell.value = header;
        Object.assign(cell, headerStyle);
      });
      detailHeaderRow.height = 25;
      currentRow++;

      // Ordenar visitas por fecha (más reciente primero)
      const visitasOrdenadas = [...grupo.visitas].sort((a, b) => {
        const fechaA = new Date(a.fecha || a.createdAt || 0);
        const fechaB = new Date(b.fecha || b.createdAt || 0);
        return fechaB - fechaA;
      });

      // Datos de visitas
      visitasOrdenadas.forEach((visita, visitaIndex) => {
        const fechaVisita = visita.fecha 
          ? new Date(visita.fecha).toLocaleDateString("es-PE")
          : visita.createdAt 
            ? new Date(visita.createdAt).toLocaleDateString("es-PE")
            : "-";
        const hora = formatHora12(visita.horaInicio || "-");
        const metodoPago = visita.metododePago || "Efectivo";
        const monto = visita.monto || 7;
        
        const row = worksheet.addRow([
          visitaIndex + 1,
          fechaVisita,
          hora,
          metodoPago,
          monto
        ]);

        row.eachCell((cell, colNumber) => {
          cell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' }
          };
          if (colNumber === 5) { // Columna de Monto
            cell.numFmt = '"S/ "#,##0.00';
            cell.font = { bold: true, color: { argb: 'FF047857' } };
          }
        });

        // Filas alternas
        if (visitaIndex % 2 === 0) {
          row.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFF3F4F6' }
          };
        }
      });

      currentRow = worksheet.rowCount + 2; // Espacio entre clientes
    });

    // Ajustar ancho de columnas para las tablas detalladas (si es necesario)
    worksheet.columns.forEach((col, index) => {
      if (index === 0) col.width = 8;   // N°
      if (index === 1) col.width = 30;  // Nombre/Fecha
      if (index === 2) col.width = 20;  // Documento/Hora
      if (index === 3) col.width = 18;  // Días/Método
      if (index === 4) col.width = 20;  // Hora/Monto
    });

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

