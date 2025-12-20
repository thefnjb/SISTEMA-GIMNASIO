const express = require('express');
const cors = require('cors');
const app = express();
const cookiesParser = require("cookie-parser");
require ('dotenv').config();

const PORT = process.env.PORT;


// Aumentar el límite para permitir imágenes en base64
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(cookiesParser());
app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true
}));
require('./DBconfig/config');

const AuthController = require('./Routes/auth');
const GymRoutes = require('./Routes/gym');
const MembresiaRoutes = require('./Routes/membresias');
const MiembrosRoutes = require('./Routes/miembros');
const EntrenadoresRoutes = require('./Routes/entrenadores');
const ClientesPorDia = require('./Routes/clientespordia');
const Trabajador = require('./Routes/trabajador');
const ReporteRoutes = require('./Routes/reportes');
const Reportepdf = require('./Routes/Reportepdf');
const Voucherpdf = require('./Routes/voucherpdf');
const excel = require("./Routes/excel");
const ReniecRoutes = require("./Routes/reniec");





app.use('/auth', AuthController);
app.use('/gym', GymRoutes);
app.use('/plans', MembresiaRoutes);
app.use('/members', MiembrosRoutes);
app.use('/trainers', EntrenadoresRoutes);
app.use('/visits', ClientesPorDia);
app.use('/report', ReporteRoutes);
app.use('/workers', Trabajador);
app.use('/pdfdia', Reportepdf);
app.use('/pdfvoucher', Voucherpdf);
app.use("/export", excel); 
app.use('/api/reniec', ReniecRoutes);

app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});