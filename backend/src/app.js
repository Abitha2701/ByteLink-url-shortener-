const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'bytelink-backend' });
});

app.use('/api', (req, res) => {
  res.status(404).json({ message: 'API endpoint not implemented yet.' });
});

module.exports = app;
