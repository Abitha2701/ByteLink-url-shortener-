const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const hpp = require('hpp');

const ApiError = require('./errors/ApiError');
const errorHandler = require('./middleware/errorHandler');

const { globalLimiter } = require('./middleware/rateLimiter');

const authRoutes = require('./routes/authRoutes');
const urlRoutes = require('./routes/urlRoutes');
const publicRoutes = require('./routes/publicRoutes');
const redirectRoutes = require('./routes/redirectRoutes');

const app = express();

/* =========================
   SECURITY HEADERS
========================= */
app.use(
  helmet({
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
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true,
    },
    frameguard: { action: 'deny' },
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  })
);

/* =========================
   HPP PROTECTION
========================= */
app.use(hpp());

/* =========================
   CORS CONFIG (FIXED)
========================= */

console.log("CORS_ORIGIN raw =", process.env.CORS_ORIGIN);

const allowedOrigins = (process.env.CORS_ORIGIN || "")
  .split(",")
  .map(o => o.trim());

console.log("Allowed CORS Origins =", allowedOrigins);

app.use(cors({origin: function (origin, callback) {
  console.log("Incoming Origin:", origin);

  if (!origin) return callback(null, true);

  if (allowedOrigins.includes(origin)) {
    console.log("Allowed Origin:", origin);
    return callback(null, true);
  }

  console.log("Blocked Origin:", origin);
  return callback(null, false);
},

  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  maxAge: 86400,
}));

// IMPORTANT: handle preflight requests properly
app.options("*", cors());

/* =========================
   BODY PARSERS
========================= */
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: false, limit: '10kb' }));

/* =========================
   DATA SANITIZATION
========================= */
app.use(mongoSanitize());

/* =========================
   RATE LIMITING
========================= */
app.use(globalLimiter);

/* =========================
   HEALTH CHECK
========================= */
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'bytelink-backend' });
});

/* =========================
   ROUTES
========================= */
app.use('/api/auth', authRoutes);
app.use('/api/urls', urlRoutes);
app.use('/api/public', publicRoutes);

/* =========================
   404 API HANDLER
========================= */
app.use('/api', (req, res, next) => {
  next(new ApiError(404, 'API endpoint not found'));
});

/* =========================
   REDIRECT ROUTES
========================= */
app.use('/', redirectRoutes);

/* =========================
   GLOBAL ERROR HANDLER
========================= */
app.use(errorHandler);

module.exports = app;