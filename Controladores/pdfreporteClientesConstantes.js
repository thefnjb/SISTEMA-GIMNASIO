const PDFDocument = require("pdfkit-table");
const ClientesPorDia = require("../Modelos/ClientesporDia");
const Trabajador = require("../Modelos/Trabajador");
const path = require("path");
const fs = require("fs");

// ===========================
// CONSTANTES Y CONFIGURACIÓN
// ===========================
const PDF_CONFIG = {
  margin: 40,
  size: "A4",
  colors: {
    primary: "#852b33",
    success: "#047857",
    dark: "#111827",
    gray: "#6b7280",
    lightGray: "#f3f4f6",
    border: "#d1d5db",
    white: "#FFFFFF",
    black: "#000000",
    evenRow: "#ffffff",
    oddRow: "#f8f9fa"
  },
  table: {
    rowHeight: 40, // Aumentado de 30 a 40 para más espacio
    maxRowsPerPage: 10, // Reducido porque las filas son más altas
    // Anchos ajustados para A4 vertical (ancho disponible: ~515 puntos)
    columnWidths: [32, 125, 90, 38, 82, 88, 60], // Suma: ~515 puntos
    headers: ["N°", "Nombre", "Documento", "Visitas", "Última Visita", "Total Gastado", "Métodos"]
  },
  text: {
    title: 16, // Reducido para mejor proporción
    subtitle: 12, // Ajustado
    normal: 10, // Aumentado de 9
    tableHeader: 11, // Aumentado de 10
    tableContent: 10, // Aumentado de 9
    stats: 10, // Reducido para mejor ajuste en el espacio
    statsTitle: 11 // Tamaño para el título de estadísticas
  }
};

// ===========================
// UTILIDADES
// ===========================

/**
 * Trunca un texto si excede la longitud máxima
 */
function truncateText(text, maxLength) {
  if (!text) return "-";
  const textStr = text.toString();
  return textStr.length > maxLength 
    ? textStr.substring(0, maxLength - 2) + ".." 
    : textStr;
}

/**
 * Formatea una fecha a formato local
 */
function formatDate(date, format = "short") {
  if (!date) return "-";
  const dateObj = new Date(date);
  if (isNaN(dateObj.getTime())) return "-";
  
  if (format === "long") {
    return dateObj.toLocaleDateString("es-ES", { 
      year: "numeric", 
      month: "long", 
      day: "numeric" 
    });
  }
  return dateObj.toLocaleDateString("es-PE");
}

/**
 * Formatea un monto a moneda local
 */
function formatCurrency(amount) {
  return `S/ ${(amount || 0).toFixed(2)}`;
}

/**
 * Valida si una imagen existe
 */
function imageExists(imagePath) {
  try {
    return fs.existsSync(imagePath);
  } catch {
    return false;
  }
}

// ===========================
// PROCESAMIENTO DE DATOS
// ===========================

/**
 * Agrupa clientes por nombre y documento
 * Combina múltiples visitas del mismo cliente
 */
function agruparClientes(clientes) {
  if (!Array.isArray(clientes) || clientes.length === 0) {
    return [];
  }

  const grupos = {};
  
  clientes.forEach((cliente) => {
    // Crear clave única para el cliente
    const nombre = (cliente.nombre || "").toLowerCase().trim();
    const tipoDoc = cliente.tipoDocumento || "DNI";
    const numDoc = (cliente.numeroDocumento || "").trim();
    
    const clave = numDoc 
      ? `${nombre}_${tipoDoc}_${numDoc}`
      : `${nombre}_sin_doc`;
    
    // Inicializar grupo si no existe
    if (!grupos[clave]) {
      grupos[clave] = {
        nombre: cliente.nombre || "Sin nombre",
        tipoDocumento: tipoDoc,
        numeroDocumento: numDoc || "-",
        visitas: [],
        totalVisitas: 0,
        totalMonto: 0,
        metodosPago: new Set(),
        ultimaVisita: null
      };
    }
    
    // Agregar información de la visita
    grupos[clave].visitas.push(cliente);
    grupos[clave].totalVisitas++;
    grupos[clave].totalMonto += cliente.monto || 7;
    
    if (cliente.metododePago) {
      grupos[clave].metodosPago.add(cliente.metododePago);
    }
    
    // Actualizar última visita
    const fechaActual = new Date(cliente.fecha || cliente.createdAt || 0);
    const fechaUltima = grupos[clave].ultimaVisita 
      ? new Date(grupos[clave].ultimaVisita.fecha || grupos[clave].ultimaVisita.createdAt || 0)
      : null;
    
    if (!fechaUltima || fechaActual > fechaUltima) {
      grupos[clave].ultimaVisita = cliente;
    }
  });
  
  // Ordenar visitas dentro de cada grupo
  Object.values(grupos).forEach((grupo) => {
    grupo.visitas.sort((a, b) => {
      const fechaA = new Date(a.fecha || a.createdAt || 0);
      const fechaB = new Date(b.fecha || b.createdAt || 0);
      return fechaB - fechaA;
    });
  });
  
  // Ordenar grupos por última visita (más reciente primero)
  return Object.values(grupos).sort((a, b) => {
    const fechaA = new Date(a.ultimaVisita?.fecha || a.ultimaVisita?.createdAt || 0);
    const fechaB = new Date(b.ultimaVisita?.fecha || b.ultimaVisita?.createdAt || 0);
    return fechaB - fechaA;
  });
}

/**
 * Obtiene y enriquece los datos de clientes
 */
async function obtenerDatosClientes() {
  const clientesDocs = await ClientesPorDia.find({})
    .sort({ fecha: -1, createdAt: -1 })
    .lean();

  // Agregar información del creador
  const clientes = await Promise.all(
    clientesDocs.map(async (cliente) => {
      if (cliente.creadoPor === "admin") {
        cliente.creadorNombre = "Administrador";
      } else if (cliente.creadoPor === "trabajador" && cliente.creadorId) {
        try {
          const trabajador = await Trabajador.findById(cliente.creadorId)
            .select("nombre")
            .lean();
          cliente.creadorNombre = trabajador?.nombre || "Trabajador desconocido";
        } catch (err) {
          console.error(`Error al obtener trabajador ${cliente.creadorId}:`, err);
          cliente.creadorNombre = "Trabajador desconocido";
        }
      } else {
        cliente.creadorNombre = "Desconocido";
      }
      return cliente;
    })
  );

  return clientes;
}

/**
 * Prepara los datos para la tabla del PDF
 */
function prepararDatosTabla(grupos) {
  return grupos.map((grupo, index) => {
    const ultimaFecha = formatDate(grupo.ultimaVisita?.fecha);
    const metodos = Array.from(grupo.metodosPago).join(", ");
    const documento = `${grupo.tipoDocumento}: ${grupo.numeroDocumento}`;
    
    // Aumentar límites de truncado para aprovechar el mayor espacio
    return [
      index + 1,
      truncateText(grupo.nombre, 30), // Aumentado de 25 a 30
      truncateText(documento, 22), // Aumentado de 18 a 22
      grupo.totalVisitas,
      ultimaFecha,
      formatCurrency(grupo.totalMonto),
      truncateText(metodos, 15) // Aumentado de 12 a 15
    ];
  });
}

// ===========================
// FUNCIONES DE DIBUJO PDF
// ===========================

/**
 * Dibuja el logo del gimnasio en el PDF
 */
function dibujarLogo(doc, logoPath) {
  if (!imageExists(logoPath)) {
    console.log("Logo no encontrado, continuando sin logo");
    return;
  }

  try {
    const logoSize = 70;
    const logoX = 50;
    const logoY = 25;
    
    doc.save();
    doc.circle(logoX + logoSize / 2, logoY + logoSize / 2, logoSize / 2).clip();
    doc.image(logoPath, logoX, logoY, { width: logoSize, height: logoSize });
    doc.restore();
    
    doc.circle(logoX + logoSize / 2, logoY + logoSize / 2, logoSize / 2)
       .lineWidth(3)
       .strokeColor(PDF_CONFIG.colors.white)
       .stroke();
  } catch (err) {
    console.error("Error al cargar logo:", err);
  }
}

/**
 * Dibuja el encabezado principal del PDF
 */
function dibujarEncabezado(doc, pageWidth, generadoPor, logoPath, esPortada = true) {
  const headerHeight = esPortada ? 140 : 110; // Aumentado para más espacio
  
  // Fondo del encabezado
  doc.rect(0, 0, pageWidth, headerHeight)
     .fillColor(PDF_CONFIG.colors.primary)
     .fill();

  // Logo solo en portada
  if (esPortada) {
    dibujarLogo(doc, logoPath);
  }

  // Título - con más espacio vertical
  const fontSize = esPortada ? PDF_CONFIG.text.title : 10;
  doc.fontSize(fontSize)
     .font("Helvetica-Bold")
     .fillColor(PDF_CONFIG.colors.white)
     .text("REPORTE DE CLIENTES CONSTANTES", 0, 35, { 
       align: "center", 
       width: pageWidth,
       lineGap: 5 // Espacio entre líneas si el texto se divide
     });

  // Subtítulo - más separado del título
  doc.fontSize(PDF_CONFIG.text.subtitle)
     .font("Helvetica")
     .fillColor(PDF_CONFIG.colors.white)
     .text("GIMNASIO TERRONES", 0, 68, { 
       align: "center", 
       width: pageWidth,
       lineGap: 3
     });

  // Información adicional - mejor espaciado
  const infoY = esPortada ? 105 : 95;
  const infoX = pageWidth - 160;
  const infoWidth = 140;
  
  if (esPortada) {
    const fechaActual = formatDate(new Date(), "long");
    doc.fontSize(PDF_CONFIG.text.normal)
       .font("Helvetica")
       .fillColor(PDF_CONFIG.colors.white)
       .text(`Fecha: ${fechaActual}`, infoX, infoY, { 
         width: infoWidth, 
         align: "right",
         lineGap: 2
       });

    doc.fontSize(PDF_CONFIG.text.normal)
       .font("Helvetica-Oblique")
       .fillColor(PDF_CONFIG.colors.white)
       .text(`Generado por: ${generadoPor}`, infoX, infoY + 18, { 
         width: infoWidth, 
         align: "right",
         lineGap: 2
       });
  } else {
    // Para páginas secundarias, mostrar número de página
    doc.fontSize(PDF_CONFIG.text.normal)
       .font("Helvetica")
       .fillColor(PDF_CONFIG.colors.white)
       .text(`Continuación...`, infoX, infoY, { 
         width: infoWidth, 
         align: "right" 
       });
  }

  return esPortada ? 160 : 130; // Más espacio después del encabezado
}

/**
 * Dibuja la caja de estadísticas
 */
function dibujarEstadisticas(doc, pageWidth, currentY, grupos, totalClientes) {
  const totalRecaudado = grupos.reduce((sum, g) => sum + g.totalMonto, 0);
  const statsBoxWidth = pageWidth - 80;
  const statsBoxHeight = 70; // Aumentado de 60 a 70
  
  // Caja contenedora
  doc.rect(40, currentY, statsBoxWidth, statsBoxHeight)
     .fillColor(PDF_CONFIG.colors.lightGray)
     .fill()
     .strokeColor(PDF_CONFIG.colors.border)
     .stroke();
  
  currentY += 15; // Espacio desde el borde superior
  
  // Título de la sección
  doc.fontSize(PDF_CONFIG.text.statsTitle)
     .font("Helvetica-Bold")
     .fillColor(PDF_CONFIG.colors.dark)
     .text("RESUMEN GENERAL", 50, currentY);
  
  currentY += 22; // Espacio después del título
  
  const statsX1 = 60;
  const statsX2 = pageWidth / 2;
  const labelSpacing = 120; // Espacio entre etiqueta y valor
  
  // Clientes únicos
  doc.fontSize(PDF_CONFIG.text.stats)
     .font("Helvetica-Bold")
     .fillColor(PDF_CONFIG.colors.primary)
     .text("Clientes Únicos:", statsX1, currentY);
  
  doc.fontSize(PDF_CONFIG.text.stats)
     .font("Helvetica-Bold")
     .fillColor(PDF_CONFIG.colors.dark)
     .text(`${grupos.length}`, statsX1 + labelSpacing, currentY);
  
  // Total visitas
  doc.fontSize(PDF_CONFIG.text.stats)
     .font("Helvetica-Bold")
     .fillColor(PDF_CONFIG.colors.primary)
     .text("Total Visitas:", statsX2, currentY);
  
  doc.fontSize(PDF_CONFIG.text.stats)
     .font("Helvetica-Bold")
     .fillColor(PDF_CONFIG.colors.dark)
     .text(`${totalClientes}`, statsX2 + 100, currentY);
  
  currentY += 16; // Espacio entre filas
  
  // Total recaudado
  doc.fontSize(PDF_CONFIG.text.statsTitle)
     .font("Helvetica-Bold")
     .fillColor(PDF_CONFIG.colors.primary)
     .text("Total Recaudado:", statsX1, currentY);
  
  doc.fontSize(PDF_CONFIG.text.statsTitle)
     .font("Helvetica-Bold")
     .fillColor(PDF_CONFIG.colors.success)
     .text(formatCurrency(totalRecaudado), statsX1 + labelSpacing, currentY);

  return currentY + 55; // Más espacio después de las estadísticas
}

/**
 * Dibuja una tabla en el PDF con paginación automática
 */
function dibujarTabla(doc, x, y, headers, data, columnWidths) {
  let currentY = y;
  const rowHeight = PDF_CONFIG.table.rowHeight;
  const tableWidth = columnWidths.reduce((a, b) => a + b, 0);

  // Validar que todos los parámetros sean válidos
  if (!x || x === undefined || !y || y === undefined || !tableWidth || tableWidth === undefined || !rowHeight || rowHeight === undefined) {
    console.error("Error: parámetros inválidos para dibujarTabla", { x, y, tableWidth, rowHeight });
    return currentY;
  }

  // Dibujar cabecera
  doc.rect(x, currentY, tableWidth, rowHeight)
     .fillColor(PDF_CONFIG.colors.primary)
     .fill();
  
  let currentX = x;
  headers.forEach((header, index) => {
    // Validar que columnWidths[index] exista
    if (!columnWidths || !columnWidths[index] || columnWidths[index] === undefined) {
      console.error(`Error: columnWidths[${index}] no está definido`);
      return;
    }
    
    doc.fillColor(PDF_CONFIG.colors.white)
       .fontSize(PDF_CONFIG.text.tableHeader)
       .font("Helvetica-Bold");
    
    const cellX = currentX + 12; // Más padding horizontal
    const cellY = currentY + 12; // Más padding vertical
    const cellWidth = Math.max(0, columnWidths[index] - 24); // Más espacio, menos padding
    
    // Separadores entre columnas
    if (index > 0) {
      doc.moveTo(currentX, currentY)
         .lineTo(currentX, currentY + rowHeight)
         .strokeColor(PDF_CONFIG.colors.white)
         .lineWidth(1)
         .opacity(0.4)
         .stroke();
      doc.opacity(1);
    }
    
    doc.text(header, cellX, cellY, {
      width: cellWidth,
      align: index === 0 ? "left" : "center"
    });
    
    currentX += columnWidths[index];
  });

  // Borde inferior del encabezado
  doc.moveTo(x, currentY + rowHeight)
     .lineTo(x + tableWidth, currentY + rowHeight)
     .strokeColor(PDF_CONFIG.colors.white)
     .lineWidth(2)
     .stroke();

  currentY += rowHeight;

  // Dibujar filas de datos
  data.forEach((row, rowIndex) => {
    const fillColor = rowIndex % 2 === 0 
      ? PDF_CONFIG.colors.evenRow 
      : PDF_CONFIG.colors.oddRow;
    
    currentX = x;
    
    // Fondo de fila
    doc.rect(x, currentY, tableWidth, rowHeight)
       .fillColor(fillColor)
       .fill();

    // Contenido de celdas
    row.forEach((cell, cellIndex) => {
      // Validar que columnWidths[cellIndex] exista
      if (!columnWidths || !columnWidths[cellIndex] || columnWidths[cellIndex] === undefined) {
        console.error(`Error: columnWidths[${cellIndex}] no está definido para la fila`);
        return;
      }
      
      // Separador vertical
      if (cellIndex > 0) {
        doc.moveTo(currentX, currentY)
           .lineTo(currentX, currentY + rowHeight)
           .strokeColor(PDF_CONFIG.colors.border)
           .lineWidth(0.5)
           .stroke();
      }
      
      const alignment = cellIndex === 0 
        ? "left" 
        : cellIndex === 5 
          ? "right" 
          : "center";
      
      const cellX = currentX + 12; // Más padding horizontal
      const cellY = currentY + 12; // Más padding vertical  
      const cellWidth = Math.max(0, columnWidths[cellIndex] - 24); // Más espacio, menos padding
      
      // Estilo de texto según columna
      doc.fontSize(PDF_CONFIG.text.tableContent);
      
      if (cellIndex === 5) {
        // Columna de Total Gastado
        doc.font("Helvetica-Bold").fillColor(PDF_CONFIG.colors.success);
      } else {
        // Texto normal
        doc.font("Helvetica").fillColor(PDF_CONFIG.colors.black);
      }
      
      doc.text(cell.toString(), cellX, cellY, {
        width: cellWidth,
        align: alignment
      });
      
      currentX += columnWidths[cellIndex];
    });

    // Borde inferior de fila
    doc.moveTo(x, currentY + rowHeight)
       .lineTo(x + tableWidth, currentY + rowHeight)
       .strokeColor(PDF_CONFIG.colors.border)
       .lineWidth(0.5)
       .stroke();

    currentY += rowHeight;
  });

  // Borde exterior de la tabla
  doc.rect(x, y, tableWidth, currentY - y)
     .strokeColor(PDF_CONFIG.colors.border)
     .lineWidth(1.5)
     .stroke();
     
  return currentY;
}

/**
 * Dibuja el pie de página
 */
function dibujarPieDePagina(doc, tableStartX, tableWidth, startIndex, endIndex, total) {
  const pageHeight = doc.page.height;
  
  doc.fontSize(8)
     .font("Helvetica")
     .fillColor(PDF_CONFIG.colors.gray);
  
  if (endIndex < total) {
    doc.text(
      `Mostrando ${startIndex + 1} - ${endIndex} de ${total} clientes`,
      tableStartX,
      pageHeight - 50,
      { width: tableWidth, align: "center" }
    );
  } else {
    doc.text(
      `Total: ${total} clientes únicos`,
      tableStartX,
      pageHeight - 50,
      { width: tableWidth, align: "center" }
    );
  }
}

// ===========================
// GENERADOR PRINCIPAL
// ===========================

/**
 * Genera el reporte PDF de clientes constantes
 */
exports.generarReporteClientesConstantesPDF = async (req, res) => {
  try {
    const { rol, id } = req.usuario;

    // Validar datos del usuario
    if (!rol || !id) {
      return res.status(401).json({ 
        error: "Usuario no autenticado correctamente" 
      });
    }

    // Obtener y procesar datos
    const clientes = await obtenerDatosClientes();
    
    if (!clientes || clientes.length === 0) {
      return res.status(404).json({ 
        error: "No se encontraron clientes registrados" 
      });
    }

    const grupos = agruparClientes(clientes);
    const datos = prepararDatosTabla(grupos);

    // Obtener nombre del generador
    let generadoPor = "Administrador";
    if (rol === "trabajador") {
      try {
        const trabajador = await Trabajador.findById(id).select("nombre").lean();
        generadoPor = trabajador?.nombre || "Trabajador";
      } catch (err) {
        console.error("Error al obtener trabajador:", err);
        generadoPor = "Trabajador";
      }
    }

    // Crear documento PDF
    const doc = new PDFDocument({ 
      margin: PDF_CONFIG.margin, 
      size: PDF_CONFIG.size 
    });
    
    // Configurar respuesta HTTP
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition", 
      "attachment; filename=reporte_clientes_constantes.pdf"
    );
    doc.pipe(res);

    const pageWidth = doc.page.width;
    const logoPath = path.join(__dirname, '..', 'gimnasio-frontend', 'public', 'images', 'logo.jpg');

    // Dibujar portada
    let currentY = dibujarEncabezado(doc, pageWidth, generadoPor, logoPath, true);
    currentY = dibujarEstadisticas(doc, pageWidth, currentY, grupos, clientes.length);

    // Dibujar tabla con paginación
    const tableStartX = 40;
    const tableWidth = pageWidth - 80;
    let startIndex = 0;
    let pageNum = 1;
    const { maxRowsPerPage, headers, columnWidths } = PDF_CONFIG.table;

    // Validar que columnWidths esté definido
    if (!columnWidths || !Array.isArray(columnWidths) || columnWidths.length === 0) {
      console.error("Error: columnWidths no está definido correctamente");
      doc.end();
      return res.status(500).json({ error: "Error en configuración del PDF" });
    }

    while (startIndex < datos.length) {
      // Nueva página si no es la primera
      if (pageNum > 1) {
        doc.addPage();
        currentY = dibujarEncabezado(doc, pageWidth, generadoPor, logoPath, false);
      }

      // Dibujar chunk de datos
      const endIndex = Math.min(startIndex + maxRowsPerPage, datos.length);
      const pageData = datos.slice(startIndex, endIndex);
      
      // Validar que currentY sea un número válido
      if (typeof currentY !== 'number' || isNaN(currentY)) {
        console.error("Error: currentY no es un número válido", currentY);
        currentY = 140; // Valor por defecto
      }
      
      currentY = dibujarTabla(
        doc, 
        tableStartX, 
        currentY, 
        headers, 
        pageData, 
        columnWidths
      );
      
      // Validar que dibujarTabla retornó un valor válido
      if (typeof currentY !== 'number' || isNaN(currentY)) {
        console.error("Error: dibujarTabla retornó un valor inválido", currentY);
        break; // Salir del bucle para evitar más errores
      }
      
      // Pie de página
      dibujarPieDePagina(doc, tableStartX, tableWidth, startIndex, endIndex, datos.length);
      
      startIndex = endIndex;
      pageNum++;
    }

    // Finalizar documento
    doc.end();

  } catch (err) {
    console.error("Error en generarReporteClientesConstantesPDF:", err);
    
    // Enviar error solo si no se han enviado headers
    if (!res.headersSent) {
      res.status(500).json({ 
        error: "Error al generar el reporte PDF.",
        details: process.env.NODE_ENV === "development" ? err.message : undefined
      });
    }
  }
};