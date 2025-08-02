const express = require('express');
const cors = require('cors');
const app = express();
const cookiesParser = require("cookie-parser");
require ('dotenv').config();

const PORT = process.env.PORT;


app.use(express.json());
app.use(cookiesParser());
app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true
}));
require('./DBconfig/config');

const GymRoutes = require('./Routes/gym');
const MembresiaRoutes = require('./Routes/membresias');
const MiembrosRoutes = require('./Routes/miembros');
const EntrenadoresRoutes = require('./Routes/entrenadores');
const ClientesPorDia = require('./Routes/clientespordia');



app.use('/auth', GymRoutes);
app.use('/plans', MembresiaRoutes);
app.use('/members', MiembrosRoutes);
app.use('/trainers', EntrenadoresRoutes);
app.use('/visits', ClientesPorDia);

app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});