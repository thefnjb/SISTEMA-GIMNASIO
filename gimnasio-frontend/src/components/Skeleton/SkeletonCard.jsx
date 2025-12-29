import React, { useEffect, useState } from 'react';

// Función para obtener color del sistema
const getColorSistema = () => {
  if (typeof window !== 'undefined') {
    return getComputedStyle(document.documentElement).getPropertyValue('--color-botones').trim() || '#D72838';
  }
  return '#D72838';
};

const SkeletonCard = ({ count = 8 }) => {
  const [colorBotones, setColorBotones] = useState('#D72838');

  useEffect(() => {
    // Actualizar color cuando cambie la variable CSS
    const updateColor = () => {
      setColorBotones(getColorSistema());
    };
    
    updateColor();
    
    // Escuchar cambios en las variables CSS
    const observer = new MutationObserver(updateColor);
    const htmlElement = document.documentElement;
    observer.observe(htmlElement, {
      attributes: true,
      attributeFilter: ['style', 'class']
    });

    // También escuchar eventos personalizados de cambio de colores
    window.addEventListener('coloresActualizados', updateColor);
    
    return () => {
      observer.disconnect();
      window.removeEventListener('coloresActualizados', updateColor);
    };
  }, []);
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 lg:gap-4">
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden"
          style={{
            animation: `pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite`,
            animationDelay: `${index * 0.1}s`
          }}
        >
          {/* Barra superior con color del sistema */}
          <div 
            className="h-1"
            style={{
              background: `linear-gradient(to right, ${colorBotones} 0%, ${colorBotones}dd 100%)`
            }}
          />
          
          {/* Contenido de la card */}
          <div className="p-3">
            {/* Nombre con icono */}
            <div className="flex items-center gap-2 mb-2">
              <div 
                className="w-7 h-7 rounded-full flex-shrink-0"
                style={{
                  backgroundColor: `${colorBotones}20`,
                  animation: `pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite`
                }}
              ></div>
              <div className="flex-1 min-w-0">
                <div 
                  className="h-4 rounded w-3/4"
                  style={{
                    backgroundColor: `${colorBotones}15`,
                    animation: `pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite`
                  }}
                ></div>
              </div>
            </div>

            {/* Información en grid compacto */}
            <div className="grid grid-cols-2 gap-2 mb-2">
              {[1, 2, 3, 4].map((item) => (
                <div key={item} className="bg-gray-50 rounded-md p-2 border border-gray-100">
                  <div 
                    className="h-2 rounded w-1/2 mb-1"
                    style={{
                      backgroundColor: `${colorBotones}10`,
                      animation: `pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite`,
                      animationDelay: `${(index * 0.1) + (item * 0.05)}s`
                    }}
                  ></div>
                  <div 
                    className="h-3 rounded w-full"
                    style={{
                      backgroundColor: `${colorBotones}10`,
                      animation: `pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite`,
                      animationDelay: `${(index * 0.1) + (item * 0.05)}s`
                    }}
                  ></div>
                </div>
              ))}
            </div>

            {/* Botones de acción */}
            <div className="flex items-center justify-center gap-1.5 pt-2 border-t border-gray-200">
              {[1, 2, 3].map((btn) => (
                <div 
                  key={btn}
                  className="w-8 h-8 rounded"
                  style={{
                    backgroundColor: `${colorBotones}15`,
                    animation: `pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite`,
                    animationDelay: `${(index * 0.1) + (btn * 0.05)}s`
                  }}
                ></div>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default SkeletonCard;

