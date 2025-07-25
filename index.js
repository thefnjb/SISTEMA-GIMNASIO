const express = require('express');
const cors = require('cors');
const app = express();


const PORT = 4000;
app.use(express.json());
app.use(cors());
require('./DBconfig/config');

const GymRoutes = require('./Routes/gym');

app.use('/auth', GymRoutes);

app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});