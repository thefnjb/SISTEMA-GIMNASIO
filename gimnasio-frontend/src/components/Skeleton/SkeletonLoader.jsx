import React from 'react';

const SkeletonLoader = () => {
  return (
    <div className="fixed inset-0 z-50 bg-gray-100 overflow-hidden">
      <div className="flex h-screen">
        {/* Skeleton del Sidebar */}
        <div 
          className="w-64 h-full flex flex-col items-center p-4 text-white shadow-2xl"
          style={{ 
            background: `linear-gradient(to bottom, var(--color-sistema, #D72838) 0%, #2E2E2E 40%, #1B1B1B 80%, #000 100%)` 
          }}
        >
          {/* Nombre de empresa */}
          <div className="w-full mb-4 text-center">
            <div className="h-6 bg-white bg-opacity-20 rounded animate-pulse mb-2"></div>
          </div>
          
          {/* Avatar */}
          <div className="mb-4">
            <div className="w-20 h-20 bg-white bg-opacity-20 rounded-full animate-pulse"></div>
          </div>
          
          {/* Botones del menú */}
          <nav className="flex flex-col w-full gap-2 mt-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div 
                key={i}
                className="h-10 bg-white bg-opacity-20 rounded animate-pulse"
                style={{ animationDelay: `${i * 0.1}s` }}
              ></div>
            ))}
          </nav>
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
