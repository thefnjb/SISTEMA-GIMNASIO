const mongoose = require('mongoose');
const VisitasDiarias = require('../Modelos/VisitasDiarias');
const Miembro = require('../Modelos/Miembro');

function buildMatch(query) {
	const match = {};
	if (query.gym) {
		try {
			match.gym = mongoose.Types.ObjectId(query.gym);
		} catch (e) {
			match.gym = null;
		}
	}
	if (query.start || query.end) {
		match.fecha = {};
		if (query.start) match.fecha.$gte = new Date(query.start);
		if (query.end) match.fecha.$lte = new Date(query.end);
	}
	return match;
}

async function getReporteMensual(req, res) {
	try {
		const match = buildMatch(req.query);
		const pipeline = [];
		if (Object.keys(match).length) pipeline.push({ $match: match });

		pipeline.push({
			$group: {
				_id: { year: { $year: '$fecha' }, month: { $month: '$fecha' } },
				visitas: { $sum: 1 },
				totalMonto: { $sum: { $ifNull: ['$monto', 0] } }
			}
		});

		pipeline.push({
			$project: {
				_id: 0,
				year: '$_id.year',
				month: '$_id.month',
				monthLabel: { $concat: [{ $toString: '$_id.year' }, '-', { $toString: '$_id.month' }] },
				visitas: 1,
				totalMonto: 1
			}
		});

		pipeline.push({ $sort: { year: 1, month: 1 } });

		const result = await VisitasDiarias.aggregate(pipeline);
		res.json(result);
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
}

async function getReporteSemanal(req, res) {
	try {
		const match = buildMatch(req.query);
		const pipeline = [];
		if (Object.keys(match).length) pipeline.push({ $match: match });

		pipeline.push({
			$addFields: {
				week: { $isoWeek: '$fecha' },
				year: { $isoWeekYear: '$fecha' }
			}
		});

		pipeline.push({
			$group: {
				_id: { year: '$year', week: '$week' },
				visitas: { $sum: 1 },
				totalMonto: { $sum: { $ifNull: ['$monto', 0] } }
			}
		});

		pipeline.push({
			$project: {
				_id: 0,
				year: '$_id.year',
				week: '$_id.week',
				weekLabel: { $concat: [{ $toString: '$_id.year' }, '-W', { $toString: '$_id.week' }] },
				visitas: 1,
				totalMonto: 1
			}
		});

		pipeline.push({ $sort: { year: 1, week: 1 } });

		const result = await VisitasDiarias.aggregate(pipeline);
		res.json(result);
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
}

async function getReporteAnual(req, res) {
	try {
		const match = buildMatch(req.query);
		const pipeline = [];
		if (Object.keys(match).length) pipeline.push({ $match: match });

		pipeline.push({
			$group: {
				_id: { year: { $year: '$fecha' } },
				visitas: { $sum: 1 },
				totalMonto: { $sum: { $ifNull: ['$monto', 0] } }
			}
		});

		pipeline.push({
			$project: {
				_id: 0,
				year: '$_id.year',
				visitas: 1,
				totalMonto: 1
			}
		});

		pipeline.push({ $sort: { year: 1 } });

		const result = await VisitasDiarias.aggregate(pipeline);
		res.json(result);
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
}

async function getReporteComparativoClientes(req, res) {
    try {
        const year = req.query.year ? parseInt(req.query.year) : new Date().getFullYear();
        const gymId = req.query.gym ? mongoose.Types.ObjectId(req.query.gym) : null;

        // 1. Aggregate daily clients from VisitasDiarias
        const dailyClientsPipeline = [
            {
                $match: {
                    fecha: {
                        $gte: new Date(`${year}-01-01T00:00:00.000Z`),
                        $lte: new Date(`${year}-12-31T23:59:59.999Z`)
                    },
                    ...(gymId && { gym: gymId })
                }
            },
            {
                $group: {
                    _id: { month: { $month: '$fecha' } },
                    count: { $sum: 1 }
                }
            }
        ];
        const dailyResults = await VisitasDiarias.aggregate(dailyClientsPipeline);

        const monthlyClientsPipeline = [
            {
                $match: {
                    fechaIngreso: {
                        $gte: new Date(`${year}-01-01T00:00:00.000Z`),
                        $lte: new Date(`${year}-12-31T23:59:59.999Z`)
                    },
                    ...(gymId && { gym: gymId })
                }
            },
            {
                $group: {
                    _id: { month: { $month: '$fechaIngreso' } },
                    count: { $sum: 1 }
                }
            }
        ];
        const monthlyResults = await Miembro.aggregate(monthlyClientsPipeline);

        // 3. Merge results
        const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
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