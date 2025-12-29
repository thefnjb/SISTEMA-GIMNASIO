import React from "react";
import EditSquareIcon from "@mui/icons-material/EditSquare";
import { IconButton } from "@mui/material";

const getColorSistema = () => {
  if (typeof window !== 'undefined') {
    return getComputedStyle(document.documentElement).getPropertyValue('--color-botones').trim() || '#D72838';
  }
  return '#D72838';
};

const BotonEditar = ({ onClick, title = "Editar", size = "small", color = null }) => {
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
      <EditSquareIcon fontSize="small" />
    </IconButton>
  );
};

export default BotonEditar;
