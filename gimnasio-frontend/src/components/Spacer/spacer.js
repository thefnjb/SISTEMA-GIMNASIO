import {Spacer, Card} from "@heroui/react";


export const CustomCard = ({ imageUrl, title, description }) => (
  <Card className="w-[280px] h-auto space-y-4 p-4 bg-gray-200" radius="2xl">
    <div className="h-[200px] w-full rounded-lg overflow-hidden bg-default-300 flex items-center justify-center">
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

export default function App() {
  return (
    <div className="flex">
      <CustomCard 
        imageUrl="https://picsum.photos/200/96?random=1"
        title="Primera Tarjeta"
       
      />
      <Spacer x={4} />
      <CustomCard 
        imageUrl="https://picsum.photos/200/96?random=2"
        title="Segunda Tarjeta"
        
      />
      <Spacer x={4} />
      <CustomCard 
        imageUrl="https://picsum.photos/200/96?random=3"
        title="Tercera Tarjeta"
       
      />
    </div>
  );
}