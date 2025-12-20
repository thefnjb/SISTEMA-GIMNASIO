// Plantillas de colores predefinidas para el sistema
const plantillasColores = {
  porDefecto: {
    nombre: "Por Defecto",
    descripcion: "Color rojo clásico del sistema",
    colorSistema: "#D72838",
    colorBotones: "#D72838",
    colorCards: "#ffffff",
    colorTablas: "#D72838",
    colorAcentos: "#D72838",
    preview: ["#D72838", "#D72838", "#ffffff", "#D72838", "#D72838"]
  },
  azul: {
    nombre: "Azul Profesional",
    descripcion: "Tema azul corporativo",
    colorSistema: "#1E40AF",
    colorBotones: "#2563EB",
    colorCards: "#ffffff",
    colorTablas: "#1E40AF",
    colorAcentos: "#2563EB",
    preview: ["#1E40AF", "#2563EB", "#ffffff", "#1E40AF", "#2563EB"]
  },
  verde: {
    nombre: "Verde Naturaleza",
    descripcion: "Tema verde fresco",
    colorSistema: "#059669",
    colorBotones: "#10B981",
    colorCards: "#ffffff",
    colorTablas: "#059669",
    colorAcentos: "#10B981",
    preview: ["#059669", "#10B981", "#ffffff", "#059669", "#10B981"]
  },
  morado: {
    nombre: "Morado Elegante",
    descripcion: "Tema morado moderno",
    colorSistema: "#7C3AED",
    colorBotones: "#8B5CF6",
    colorCards: "#ffffff",
    colorTablas: "#7C3AED",
    colorAcentos: "#8B5CF6",
    preview: ["#7C3AED", "#8B5CF6", "#ffffff", "#7C3AED", "#8B5CF6"]
  },
  naranja: {
    nombre: "Naranja Energía",
    descripcion: "Tema naranja vibrante",
    colorSistema: "#EA580C",
    colorBotones: "#F97316",
    colorCards: "#ffffff",
    colorTablas: "#EA580C",
    colorAcentos: "#F97316",
    preview: ["#EA580C", "#F97316", "#ffffff", "#EA580C", "#F97316"]
  },
  oscuro: {
    nombre: "Modo Oscuro",
    descripcion: "Tema oscuro elegante",
    colorSistema: "#1F2937",
    colorBotones: "#374151",
    colorCards: "#111827",
    colorTablas: "#374151",
    colorAcentos: "#4B5563",
    preview: ["#1F2937", "#374151", "#111827", "#374151", "#4B5563"]
  },
  rosa: {
    nombre: "Rosa Moderno",
    descripcion: "Tema rosa contemporáneo",
    colorSistema: "#DB2777",
    colorBotones: "#EC4899",
    colorCards: "#ffffff",
    colorTablas: "#DB2777",
    colorAcentos: "#EC4899",
    preview: ["#DB2777", "#EC4899", "#ffffff", "#DB2777", "#EC4899"]
  },
  cyan: {
    nombre: "Cyan Tecnológico",
    descripcion: "Tema cyan futurista",
    colorSistema: "#0891B2",
    colorBotones: "#06B6D4",
    colorCards: "#ffffff",
    colorTablas: "#0891B2",
    colorAcentos: "#06B6D4",
    preview: ["#0891B2", "#06B6D4", "#ffffff", "#0891B2", "#06B6D4"]
  }
};

// Función para obtener una plantilla por nombre
function obtenerPlantilla(nombre) {
  return plantillasColores[nombre] || plantillasColores.porDefecto;
}

// Función para obtener todas las plantillas
function obtenerTodasPlantillas() {
  return Object.entries(plantillasColores).map(([key, value]) => ({
    id: key,
    ...value
  }));
}

module.exports = {
  plantillasColores,
  obtenerPlantilla,
  obtenerTodasPlantillas
};

