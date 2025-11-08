const consultarDni = async (req, res) => {
  const { numero } = req.params;

  if (!numero || !/^\d{8}$/.test(numero)) {
    return res.status(400).json({ error: 'El número de DNI debe tener 8 dígitos.' });
  }

  const url = `https://api.decolecta.com/v1/reniec/dni?numero=${numero}`;
  const token = process.env.DECOLECTA_API_TOKEN;

  if (!token) {
    console.error('El token de la API no está configurado en el archivo .env');
    return res.status(500).json({ error: 'Error interno del servidor.' });
  }

  try {
    // Intentar usar fetch global (Node 18+) o importar node-fetch como fallback
    let fetchFn;
    if (typeof globalThis.fetch === 'function') {
      fetchFn = globalThis.fetch.bind(globalThis);
    } else {
      const mod = await import('node-fetch');
      fetchFn = mod.default || mod;
    }

    const response = await fetchFn(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    let data = null;
    try {
      data = await response.json();
    } catch (parseErr) {
      console.error('No se pudo parsear JSON de la respuesta de Decolecta:', parseErr);
    }


    if (!response.ok) {
      // Si la API de decolecta devuelve un error (ej. DNI no encontrado)
      const mensaje = data?.message || data || 'Error al consultar el DNI.';
      return res.status(response.status).json({ error: mensaje });
    }

    return res.status(200).json(data);

  } catch (error) {
    console.error('Error al conectar con la API de RUC/DNI:', error);
    res.status(500).json({ error: 'No se pudo conectar con el servicio de consulta.' });
  }
};

module.exports = {
  consultarDni,
};
