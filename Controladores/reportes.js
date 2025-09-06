const mongoose = require('mongoose');
const Miembro = require('../Modelos/Miembro');
const ClientesPorDia = require('../Modelos/ClientesporDia');

// --- Funciones Refactorizadas ---

// Función de ayuda para construir el filtro base de forma segura
function buildBaseMatch(req) {
    const { gym_id } = req.usuario; // ID del gym obtenido del token verificado
    const match = { gym: new mongoose.Types.ObjectId(gym_id) };

    if (req.query.start || req.query.end) {
        match.fecha = {};
        if (req.query.start) match.fecha.$gte = new Date(req.query.start);
        if (req.query.end) match.fecha.$lte = new Date(req.query.end);
    }
    return match;
}

// Reporte Mensual de Clientes por Día
async function getReporteMensual(req, res) {
    try {
        const match = buildBaseMatch(req);
        const pipeline = [
            { $match: match },
            {
                $group: {
                    _id: { year: { $year: '$fecha' }, month: { $month: '$fecha' } },
                    visitas: { $sum: 1 },
                    totalMonto: { $sum: { $ifNull: ['$precio', 7] } }
                }
            },
            {
                $project: {
                    _id: 0,
                    year: '$_id.year',
                    month: '$_id.month',
                    visitas: 1,
                    totalMonto: 1
                }
            },
            { $sort: { year: 1, month: 1 } }
        ];

        const result = await ClientesPorDia.aggregate(pipeline);
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

// Reporte Semanal de Clientes por Día
async function getReporteSemanal(req, res) {
    try {
        const match = buildBaseMatch(req);
        const pipeline = [
            { $match: match },
            { $addFields: { week: { $isoWeek: '$fecha' }, year: { $isoWeekYear: '$fecha' } } },
            {
                $group: {
                    _id: { year: '$year', week: '$week' },
                    visitas: { $sum: 1 },
                    totalMonto: { $sum: { $ifNull: ['$precio', 7] } }
                }
            },
            { $project: { _id: 0, year: '$_id.year', week: '$_id.week', visitas: 1, totalMonto: 1 } },
            { $sort: { year: 1, week: 1 } }
        ];

        const result = await ClientesPorDia.aggregate(pipeline);
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

// Reporte Anual de Clientes por Día
async function getReporteAnual(req, res) {
    try {
        const match = buildBaseMatch(req);
        const pipeline = [
            { $match: match },
            {
                $group: {
                    _id: { year: { $year: '$fecha' } },
                    visitas: { $sum: 1 },
                    totalMonto: { $sum: { $ifNull: ['$precio', 7] } }
                }
            },
            { $project: { _id: 0, year: '$_id.year', visitas: 1, totalMonto: 1 } },
            { $sort: { year: 1 } }
        ];

        const result = await ClientesPorDia.aggregate(pipeline);
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

// Reporte Comparativo (Clientes por Día vs. Miembros Nuevos)
async function getReporteComparativoClientes(req, res) {
    try {
        const { gym_id } = req.usuario;
        const year = req.query.year ? parseInt(req.query.year) : new Date().getFullYear();

        const startOfYear = new Date(year, 0, 1);
        const endOfYear = new Date(year, 11, 31, 23, 59, 59);

        // Filtro para inscripciones (miembros)
        const matchFilter = {
            gym: new mongoose.Types.ObjectId(gym_id),
            fechaIngreso: { $gte: startOfYear, $lte: endOfYear }
        };

        // Filtro para visitas diarias
        const dailyMatchFilter = {
            gym: new mongoose.Types.ObjectId(gym_id),
            fecha: { $gte: startOfYear, $lte: endOfYear }
        };

        const dailyResults = await ClientesPorDia.aggregate([
            { $match: dailyMatchFilter },
            { $group: { _id: { month: { $month: '$fecha' } }, count: { $sum: 1 } } }
        ]);

        const monthlyResults = await Miembro.aggregate([
            { $match: matchFilter },
            { $group: { _id: { month: { $month: '$fechaIngreso' } }, count: { $sum: 1 } } }
        ]);

        const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

        const mergedData = monthNames.map((monthName, index) => {
            const month = index + 1;
            const daily = dailyResults.find(item => item._id.month === month);
            const monthly = monthlyResults.find(item => item._id.month === month);
            return {
                month: monthName,
                month_num: month,
                year: year,
                clientesPorDia: daily ? daily.count : 0,
                clientesPorMensualidad: monthly ? monthly.count : 0
            };
        });

        res.json(mergedData);

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

module.exports = {
    getReporteMensual,
    getReporteSemanal,
    getReporteAnual,
    getReporteComparativoClientes
};
