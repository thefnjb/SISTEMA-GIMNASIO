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

const AuthController = require('./Routes/auth');
const MembresiaRoutes = require('./Routes/membresias');
const MiembrosRoutes = require('./Routes/miembros');
const EntrenadoresRoutes = require('./Routes/entrenadores');
const ClientesPorDia = require('./Routes/clientespordia');
const Trabajador = require('./Routes/trabajador');
const ReporteRoutes = require('./Routes/reportes');



app.use('/auth', AuthController);
app.use('/plans', MembresiaRoutes);
app.use('/members', MiembrosRoutes);
app.use('/trainers', EntrenadoresRoutes);
app.use('/visits', ClientesPorDia);
app.use('/report', ReporteRoutes);
app.use('/workers', Trabajador);

app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});