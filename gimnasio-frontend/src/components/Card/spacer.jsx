import { Card } from "@heroui/react";
import { useState } from "react";

export const CustomCard = ({ imageUrl, title, description, children, className = "" }) => {
  const [imageError, setImageError] = useState(false);

  const handleImageError = () => {
    setImageError(true);
  };

  return (
    <Card
      className={`h-auto p-3 sm:p-4 bg-gray-200 rounded-xl sm:rounded-2xl shadow-sm transition-all duration-200 ${className}`}
      radius="xl"
    >
      <div className="flex flex-col space-y-3 sm:space-y-4">
        {imageUrl && !imageError ? (
          <img
            src={imageUrl}
            alt={title || "Imagen"}
            className="object-cover w-full h-auto max-h-48 sm:max-h-64"
            onError={handleImageError}
          />
        ) : (
          <div className="flex items-center justify-center w-full h-32 sm:h-48 text-xs text-gray-500 bg-gray-300 rounded">
            {imageError ? "Imagen no disponible" : "Sin imagen"}
          </div>
        )}
      </div>
      <div className="flex flex-col mt-3 sm:mt-4 space-y-2">
        <h3 className="text-sm sm:text-base font-semibold text-center text-black">
          {title || ""}
        </h3>
        <p className="text-xs sm:text-sm text-default-500">{description || ""}</p>
        {children && <div className="flex justify-center mt-3 sm:mt-4">{children}</div>}
      </div>
    </Card>
  );
};