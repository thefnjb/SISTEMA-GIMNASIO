import React from "react";
import DeleteIcon from "@mui/icons-material/Delete";
import { IconButton } from "@mui/material";

const getColorSistema = () => {
  if (typeof window !== 'undefined') {
    return getComputedStyle(document.documentElement).getPropertyValue('--color-botones').trim() || '#D72838';
  }
  return '#D72838';
};

const BotonEliminar = ({ onClick, title = "Eliminar", size = "small", color = null }) => {
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
      <DeleteIcon fontSize="small" />
    </IconButton>
  );
};

export default BotonEliminar;
