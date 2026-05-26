module.exports = async (req, res) => {
  const backendUrl = 'https://backend-sr4i.onrender.com/invoices';
  try {
    const fetchOptions = {
      method: req.method || 'GET',
      headers: {
        accept: 'application/json',
        'content-type': 'application/json',
      },
    };

    // forward authorization header if present
    if (req.headers && req.headers.authorization) {
      fetchOptions.headers.authorization = req.headers.authorization;
    }

    // forward request body for POST/PUT
    if (req.body && (req.method === 'POST' || req.method === 'PUT')) {
      fetchOptions.body = JSON.stringify(req.body);
    }

    const backendRes = await fetch(backendUrl, fetchOptions);
    const text = await backendRes.text();

    // Copy important headers
    const contentType = backendRes.headers.get('content-type') || 'application/json';
    res.status(backendRes.status).setHeader('content-type', contentType);

    // Try parse JSON, otherwise send text
    try {
      const data = JSON.parse(text);
      res.end(JSON.stringify(data));
    } catch (e) {
      res.end(text);
    }
  } catch (err) {
    res.status(502).json({ error: 'Bad gateway', details: err.message });
  }
};
