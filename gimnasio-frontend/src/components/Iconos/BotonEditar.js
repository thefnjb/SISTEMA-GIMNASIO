import React from "react";
import EditSquareIcon from "@mui/icons-material/EditSquare";
import { IconButton } from "@mui/material";

const BotonEditar = ({ onClick, title = "Editar", size = "small", color = "#555" }) => (
  <IconButton
    size={size}
    onClick={onClick}
    sx={{ color }}
    title={title}
  >
    <EditSquareIcon fontSize="small" />
  </IconButton>
);

export default BotonEditar;
