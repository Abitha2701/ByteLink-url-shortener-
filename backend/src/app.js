const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const hpp = require('hpp');
const ApiError = require('./errors/ApiError');
const errorHandler = require('./middleware/errorHandler');
const { globalLimiter, authLimiter, bulkUploadLimiter } = require('./middleware/rateLimiter');
const authRoutes = require('./routes/authRoutes');
const urlRoutes = require('./routes/urlRoutes');
const publicRoutes = require('./routes/publicRoutes');
const redirectRoutes = require('./routes/redirectRoutes');

const app = express();

// Security Middleware

// 1. Helmet - Set various HTTP headers
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", 'data:', 'https:'],
      connectSrc: ["'self'"],
    },
  },
  hsts: {
    maxAge: 31536000, // 1 year in seconds
    includeSubDomains: true,
    preload: true
  },
  frameguard: {
    action: 'deny'
  },
  referrerPolicy: {
    policy: 'strict-origin-when-cross-origin'
  }
}));

// 2. HPP - Prevent HTTP Parameter Pollution
app.use(hpp());

// 3. CORS - Enhanced configuration
app.use(cors({
  origin: function (origin, callback) {
    const allowedOrigins = (process.env.CORS_ORIGIN || "http://localhost:5173")
      .split(",")
      .map(o => o.trim());       

    if (!origin || allowedOrigins.includes(origin) || allowedOrigins.includes("*")) {
      return callback(null, true);
    }

    console.warn(`Blocked CORS request from: ${origin}`);
    return callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  maxAge: 86400
}));

// 4. Body parsers with limits
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: false, limit: '10kb' }));

// 5. Data sanitization against NoSQL injection
app.use(mongoSanitize());

// 6. Global rate limiting
app.use(globalLimiter);

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
