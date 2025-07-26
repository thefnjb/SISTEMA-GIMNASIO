import { Card} from "@heroui/react";
import { useState } from "react";


export const CustomCard = ({ imageUrl, title, description, children }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isActive, setIsActive] = useState(false);

  return (
    <Card className={`max-w-[300px] w-full h-auto p-4 bg-gray-200 rounded-2xl shadow-sm transition-all duration-200
        ${isHovered ? 'ring-2 bg-slate-500 scale-[1.03]' : ''}
        ${isActive ? 'ring-4 bg-slate-400 scale-[0.98]' : ''}`}

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
      <div className="flex flex-col space-y-2 mt-4">
        <h3 className="text-base font-semibold  text-center text-black">
          {title || "Título por defecto"}
        </h3>
        <p className="text-sm text-default-500">
          {description || ""}
        </p>
        {children && (
          <div className="mt-4 flex justify-center">{children}</div>
        )}
      </div>
    </Card>
  );
};