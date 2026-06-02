const express = require('express');
const cors = require('cors');
const ApiError = require('./errors/ApiError');
const errorHandler = require('./middleware/errorHandler');
const authRoutes = require('./routes/authRoutes');
const urlRoutes = require('./routes/urlRoutes');
const publicRoutes = require('./routes/publicRoutes');
const redirectRoutes = require('./routes/redirectRoutes');

const app = express();

app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }));
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: false, limit: '10kb' }));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'bytelink-backend' });
});

app.use('/api/auth', authRoutes);
app.use('/api/urls', urlRoutes);
app.use('/api/public', publicRoutes);

app.use('/api', (req, res, next) => {
  next(new ApiError(404, 'API endpoint not found'));
});

app.use('/', redirectRoutes);
app.use(errorHandler);

module.exports = app;
