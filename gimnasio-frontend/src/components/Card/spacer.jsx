import { Card } from "@heroui/react";
import { useState } from "react";

export const CustomCard = ({ imageUrl, title, description, children }) => {
  const [imageError, setImageError] = useState(false);

  const handleImageError = () => {
    setImageError(true);
  };

  return (
    <Card
      className="max-w-[300px] w-full h-auto p-4 bg-gray-200 rounded-2xl shadow-sm transition-all duration-200"
      radius="2xl"
    >
      <div className="flex flex-col space-y-4">
        {imageUrl && !imageError ? (
          <img
            src={imageUrl}
            alt={title || "Imagen"}
            className="object-cover w-full h-full"
            onError={handleImageError}
          />
        ) : (
          <div className="flex items-center justify-center w-full h-48 text-xs text-gray-500 bg-gray-300 rounded">
            {imageError ? "Imagen no disponible" : "Sin imagen"}
          </div>
        )}
      </div>
      <div className="flex flex-col mt-4 space-y-2">
        <h3 className="text-base font-semibold text-center text-black">
          {title || ""}
        </h3>
        <p className="text-sm text-default-500">{description || ""}</p>
        {children && <div className="flex justify-center mt-4">{children}</div>}
      </div>
    </Card>
  );
};