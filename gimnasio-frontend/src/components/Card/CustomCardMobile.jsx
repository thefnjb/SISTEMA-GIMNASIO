import { Card } from "@heroui/react";
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import GlitchText from '../TextAnimation/GlitchText';

export const CustomCardMobile = ({ title, description, children, className = "" }) => {
  return (
    <Card
      className={`w-full bg-color-cards rounded-xl shadow-md hover:shadow-lg transition-all duration-200 border border-gray-200 ${className}`}
      radius="lg"
    >
      <div className="flex flex-row items-center justify-between gap-2 xs:gap-3 sm:gap-4 p-2 xs:p-3 sm:p-4">
        {/* Lado izquierdo: Icono y título */}
        <div className="flex flex-row items-center gap-2 xs:gap-3 sm:gap-4 flex-1 min-w-0">
          {/* Icono FitnessCenter */}
          <div className="flex-shrink-0 w-16 h-16 xs:w-20 xs:h-20 sm:w-24 sm:h-24 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--color-botones)' }}>
            <FitnessCenterIcon sx={{ fontSize: { xs: 28, sm: 32, md: 36 }, color: 'white' }} />
          </div>
          
          {/* Título con efecto Glitch */}
          {title && (
            <div className="flex-1 min-w-0">
              <GlitchText
                speed={1}
                enableShadows={true}
                enableOnHover={true}
                textSize="lg"
                className="text-base xs:text-lg sm:text-xl md:text-2xl truncate"
              >
                {title}
              </GlitchText>
            </div>
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

