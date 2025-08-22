import React from "react";
import DeleteIcon from "@mui/icons-material/Delete";
import { IconButton } from "@mui/material";


const BotonEliminar = ({ onClick, title = "Eliminar", size = "small", color = "#555" }) => (
  <IconButton
    size={size}
    onClick={onClick}
    sx={{ color }}
    title={title}
  >
    <DeleteIcon fontSize="small" />
  </IconButton>
);

export default BotonEliminar;
