import React from "react";
import AutorenewIcon from "@mui/icons-material/Autorenew";
import { IconButton } from "@mui/material";

const BotonRenovar = ({ onClick, title = "Renovar", size = "small", color = "#555" }) => (
  <IconButton
    size={size}
    onClick={onClick}
    sx={{ color }}
    title={title}
  >
    <AutorenewIcon fontSize="small" />
  </IconButton>
);

export default BotonRenovar;
