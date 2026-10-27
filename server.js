const express = require('express');
const path = require('path');
const GameDig = require('gamedig');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

app.get('/api/status', async (req, res) => {
  const host = process.env.SERVER_HOST;
  const port = process.env.SERVER_QUERY_PORT;

  if (!host || !port) {
    return res.status(400).json({
      error: 'SERVER_HOST and SERVER_QUERY_PORT not configured in environment'
    });
  }

  try {
    const state = await GameDig.query({
      type: 'enshrouded',
      host: host,
      port: parseInt(port, 10),
      timeout: 5000
    });
    res.json({ ok: true, data: state });
  } catch (err) {
    res.status(503).json({
      ok: false,
      error: err.message || 'Failed to query server',
      host,
      port
    });
  }
});

app.get('/api/health', (req, res) => {
  res.json({ ok: true });
});

app.listen(PORT, () => {
  console.log(`Enshrouded Statuspage running on http://localhost:${PORT}`);
});
