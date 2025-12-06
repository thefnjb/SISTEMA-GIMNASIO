import { Card } from "@heroui/react";
import { useState } from "react";

export const CustomCardMobile = ({ imageUrl, title, description, children, className = "" }) => {
  const [imageError, setImageError] = useState(false);

  const handleImageError = () => {
    setImageError(true);
  };

  return (
    <Card
      className={`w-full bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-200 border border-gray-200 ${className}`}
      radius="lg"
    >
      <div className="flex flex-row items-center justify-between gap-2 xs:gap-3 sm:gap-4 p-2 xs:p-3 sm:p-4">
        {/* Lado izquierdo: Imagen y título */}
        <div className="flex flex-row items-center gap-2 xs:gap-3 sm:gap-4 flex-1 min-w-0">
          {/* Imagen más grande */}
          <div className="flex-shrink-0 w-20 h-20 xs:w-24 xs:h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 rounded-lg xs:rounded-xl overflow-hidden bg-gray-100 shadow-sm">
            {imageUrl && !imageError ? (
              <img
                src={imageUrl}
                alt={title || "Imagen"}
                className="object-cover w-full h-full"
                onError={handleImageError}
              />
            ) : (
              <div className="flex items-center justify-center w-full h-full text-[10px] xs:text-xs text-gray-400">
                Sin img
              </div>
            )}
          </div>
          
          {/* Título */}
          {title && (
            <h3 className="text-sm xs:text-base sm:text-lg font-semibold text-gray-900 truncate">
              {title}
            </h3>
          )}
        </div>
        
        {/* Lado derecho: Botones */}
        {children && (
          <div className="flex items-center gap-1.5 xs:gap-2 flex-shrink-0">
            {children}
          </div>
        )}
      </div>
    </Card>
  );
};

