import React from "react";
import CreateIcon from "@mui/icons-material/Create";
import { IconButton } from "@mui/material";

const BotonEditarDeuda = ({ onClick, title = "Editar deuda", size = "small", color = "#555" }) => (
  <IconButton
    size={size}
    onClick={onClick}
    sx={{ color }}
    title={title}
  >
    <CreateIcon fontSize="small" />
  </IconButton>
);

export default BotonEditarDeuda;
