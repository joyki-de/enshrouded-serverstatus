const express = require('express');
const path = require('path');
const gamedig = require('gamedig');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

const queryServer = async (options) => {
  if (gamedig && gamedig.GameDig && typeof gamedig.GameDig.query === 'function') {
    return await gamedig.GameDig.query(options);
  }
  if (gamedig && typeof gamedig.query === 'function') {
    return await gamedig.query(options);
  }
  if (gamedig && gamedig.default) {
    if (gamedig.default.GameDig && typeof gamedig.default.GameDig.query === 'function') {
      return await gamedig.default.GameDig.query(options);
    }
    if (typeof gamedig.default.query === 'function') {
      return await gamedig.default.query(options);
    }
    if (typeof gamedig.default === 'function') {
      return await gamedig.default(options);
    }
  }
  if (typeof gamedig === 'function') {
    return await gamedig(options);
  }
  throw new Error('GameDig.query is not available');
};

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
    const state = await queryServer({
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
