import React from 'react';

const SkeletonLoader = () => {
  const colorSistema = typeof window !== 'undefined' 
    ? getComputedStyle(document.documentElement).getPropertyValue('--color-sistema').trim() || '#D72838'
    : '#D72838';

  return (
    <div className="fixed inset-0 z-50 bg-gray-100 overflow-hidden">
      <div className="flex h-screen">
        {/* Skeleton del Sidebar */}
        <div 
          className="w-full max-w-72 h-full flex flex-col text-white shadow-2xl overflow-hidden"
          style={{ 
            background: `linear-gradient(to bottom, ${colorSistema} 0%, #1a1a1a 50%, #0a0a0a 100%)` 
          }}
        >
          {/* Header con logo */}
          <div className="w-full p-4 md:p-6 pb-4 border-b border-white/10 flex-shrink-0">
            <div className="flex flex-col items-center gap-3">
              {/* Logo skeleton */}
              <div className="w-16 h-16 md:w-20 md:h-20 rounded-xl bg-white/20 animate-pulse"></div>
              {/* Nombre de empresa skeleton */}
              <div className="h-5 w-32 bg-white/20 rounded animate-pulse"></div>
            </div>
          </div>
          
          {/* Avatar skeleton */}
          <div className="flex-shrink-0 px-4 pt-4 pb-2">
            <div className="flex flex-col items-center gap-2">
              <div className="h-6 w-24 bg-white/20 rounded animate-pulse"></div>
            </div>
          </div>
          
          {/* Separador */}
          <div className="w-full h-px bg-white/10 my-4"></div>
          
          {/* Botones del menú */}
          <nav className="flex flex-col w-full gap-2 px-3 md:px-4 flex-1">
            {[1, 2, 3, 4, 5].map((i) => (
              <div 
                key={i}
                className="h-12 bg-white/10 rounded-xl animate-pulse border-l-4 border-transparent"
                style={{ animationDelay: `${i * 0.1}s` }}
              ></div>
            ))}
          </nav>
          
          {/* Separador antes del logout */}
          <div className="w-full h-px bg-white/10 my-2"></div>
          
          {/* Botón logout skeleton */}
          <div className="flex-shrink-0 px-3 md:px-4 pb-4">
            <div className="h-12 bg-white/10 rounded-lg animate-pulse border border-white/20"></div>
          </div>
        </div>
        
        {/* Skeleton del Contenido Principal */}
        <div className="flex-1 overflow-auto bg-white">
          <div className="p-6">
            {/* Header con botón */}
            <div className="flex justify-end mb-6">
              <div 
                className="h-10 w-32 rounded animate-pulse"
                style={{ backgroundColor: 'var(--color-botones, #D72838)' }}
              ></div>
            </div>
            
            {/* Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {[1, 2, 3].map((i) => (
                <div 
                  key={i}
                  className="h-48 rounded-lg animate-pulse"
                  style={{ backgroundColor: 'var(--color-cards, #ffffff)', border: '1px solid #e5e7eb' }}
                >
                  <div className="p-4">
                    <div className="h-6 bg-gray-200 rounded mb-4"></div>
                    <div className="h-8 bg-gray-200 rounded w-3/4"></div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Tabla skeleton */}
            <div className="bg-white rounded-lg shadow">
              {/* Header de tabla */}
              <div 
                className="h-12 rounded-t-lg"
                style={{ background: 'linear-gradient(to right, #1f2937, var(--color-tablas, #D72838))' }}
              ></div>
              
              {/* Filas de tabla */}
              <div className="p-4 space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex items-center gap-4">
                    <div className="h-10 flex-1 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-10 w-24 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-10 w-24 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SkeletonLoader;
