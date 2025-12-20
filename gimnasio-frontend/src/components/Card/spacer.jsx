import { Card } from "@heroui/react";
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import GlitchText from '../TextAnimation/GlitchText';

export const CustomCard = ({ title, description, children, className = "" }) => {
  return (
    <Card
      className={`h-auto p-3 sm:p-4 bg-color-cards rounded-xl sm:rounded-2xl shadow-sm transition-all duration-200 ${className}`}
      radius="xl"
    >
      <div className="flex flex-col items-center space-y-3 sm:space-y-4">
        {/* Icono FitnessCenter */}
        <div className="flex items-center justify-center w-20 h-20 sm:w-24 sm:h-24 rounded-full" style={{ backgroundColor: 'var(--color-botones)' }}>
          <FitnessCenterIcon sx={{ fontSize: 40, color: 'white' }} />
        </div>
        
        {/* Título con efecto Glitch */}
        {title && (
          <div className="text-center">
            <GlitchText
              speed={1}
              enableShadows={true}
              enableOnHover={true}
              textSize="lg"
              className="text-lg sm:text-xl md:text-2xl"
            >
              {title}
            </GlitchText>
          </div>
        )}
        
        {/* Descripción */}
        {description && (
          <p className="text-xs sm:text-sm text-center text-gray-600">{description}</p>
        )}
        
        {/* Botones/Acciones */}
        {children && <div className="flex justify-center mt-2 sm:mt-3">{children}</div>}
      </div>
    </Card>
  );
};