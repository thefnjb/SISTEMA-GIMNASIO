import { Card} from "@heroui/react";
import { useState } from "react";


export const CustomCard = ({ imageUrl, title, description }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isActive, setIsActive] = useState(false);

  return (
    <Card className={`max-w-[300px] w-full h-auto p-4 bg-gray-200 rounded-2xl shadow-sm transition-all duration-200
        ${isHovered ? 'ring-2 ring-black/15 scale-[1.03]' : ''}
        ${isActive ? 'ring-4 ring-black/15 scale-[0.98]' : ''}`}

      radius="2xl"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => { setIsHovered(false); setIsActive(false); }}
      onMouseDown={() => setIsActive(true)}
      onMouseUp={() => setIsActive(false)}
    >
      <div className="flex flex-col space-y-4">
        {imageUrl ? (
          <img 
            src={imageUrl} 
            alt={title || "Imagen"} 
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.parentElement.innerHTML = '<div class="w-full h-full bg-default-300 flex items-center justify-center text-xs text-default-500">Imagen no disponible</div>';
            }}
          />
        ) : (
          <div className="w-full h-full bg-default-300 flex items-center justify-center text-xs text-default-500">
            Sin imagen
          </div>
        )}
      </div>
      <div className="space-y-2">
        <h3 className="text-base font-semibold text-default-700 text-center">
          {title || "Título por defecto"}
        </h3>
        <p className="text-sm text-default-500">
          {description || ""}
        </p>
      </div>
    </Card>
  );
};