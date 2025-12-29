import React from "react";
import CreateIcon from "@mui/icons-material/Create";
import { IconButton } from "@mui/material";

const getColorSistema = () => {
  if (typeof window !== 'undefined') {
    return getComputedStyle(document.documentElement).getPropertyValue('--color-botones').trim() || '#D72838';
  }
  return '#D72838';
};

const BotonEditarDeuda = ({ onClick, title = "Editar deuda", size = "small", color = null }) => {
  const iconColor = color || getColorSistema();
  return (
    <IconButton
      size={size}
      onClick={onClick}
      sx={{ 
        color: iconColor,
        "&:hover": { 
          color: iconColor,
          opacity: 0.8 
        }
      }}
      title={title}
    >
      <CreateIcon fontSize="small" />
    </IconButton>
  );
};

export default BotonEditarDeuda;
