// ========================================
// Backend Constants - Centralized Configuration
// ========================================

// Validation Rules
const VALIDATION = {
  SHORT_CODE: {
    MIN_LENGTH: 4,
    MAX_LENGTH: 30,
    PATTERN: /^[A-Za-z0-9_-]+$/,
    AUTO_GENERATE_LENGTH: 8,
  },
  PASSWORD: {
    MIN_LENGTH: 8,
    REQUIRE_UPPERCASE: true,
    REQUIRE_LOWERCASE: true,
    REQUIRE_NUMBER: true,
  },
  URL: {
    PROTOCOLS: ['http://', 'https://'],
    MAX_LENGTH: 2048,
  },
  REQUEST: {
    JSON_LIMIT: '10kb',
    URLENCODED_LIMIT: '10kb',
    FILE_SIZE_LIMIT: 10 * 1024 * 1024, // 10MB
  },
};

// Rate Limiting Configuration
const RATE_LIMIT = {
  GLOBAL: {
    WINDOW_MS: 15 * 60 * 1000, // 15 minutes
    MAX_REQUESTS: 100,
    MESSAGE: 'Too many requests from this IP, please try again later',
  },
  AUTH: {
    WINDOW_MS: 15 * 60 * 1000, // 15 minutes
    MAX_ATTEMPTS: 5,
    MESSAGE: 'Too many authentication attempts, please try again later',
  },
  BULK_UPLOAD: {
    WINDOW_MS: 60 * 60 * 1000, // 1 hour
    MAX_UPLOADS: 10,
    MESSAGE: 'Too many bulk uploads, please try again later',
  },
};

// HTTP Status Codes
const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  GONE: 410,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
};

// Error Messages
const ERROR_MESSAGES = {
  // Validation
  INVALID_URL: 'Please provide a valid URL using http:// or https://',
  INVALID_ALIAS: 'Custom alias must be 4-30 characters and may only contain letters, numbers, hyphens, and underscores',
  INVALID_EMAIL: 'Please provide a valid email address',
  INVALID_PASSWORD: 'Password must be at least 8 characters and contain uppercase, lowercase, and numbers',
  INVALID_DATE: 'Expiration date must be a valid date',
  PAST_DATE: 'Expiration date must be in the future',

  // URL
  URL_REQUIRED: 'The longUrl field is required',
  ALIAS_IN_USE: 'The custom alias is already in use. Please choose another one',
  DUPLICATE_URL: 'A short URL already exists for this destination. Delete the existing one first to choose a new custom alias',
  URL_NOT_FOUND: 'Short URL not found',
  URL_EXPIRED: 'This link has expired',
  UNABLE_TO_CREATE_URL: 'Unable to create a unique shortened URL at this time',

  // Auth
  EMAIL_REQUIRED: 'Email is required',
  PASSWORD_REQUIRED: 'Password is required',
  NAME_REQUIRED: 'Name is required',
  INVALID_CREDENTIALS: 'Invalid credentials',
  AUTHENTICATION_REQUIRED: 'Authentication required',
  EMAIL_IN_USE: 'Email already in use',
  USER_NOT_FOUND: 'User not found',

  // General
  INTERNAL_ERROR: 'Internal server error',
  NOT_FOUND: 'Resource not found',
  UNAUTHORIZED: 'Unauthorized access',
  FORBIDDEN: 'Forbidden',
  CORS_ERROR: 'Not allowed by CORS',
};

// Success Messages
const SUCCESS_MESSAGES = {
  URL_CREATED: 'URL created successfully',
  URL_UPDATED: 'URL updated successfully',
  URL_DELETED: 'URL deleted successfully',
  LOGIN_SUCCESS: 'Login successful',
  SIGNUP_SUCCESS: 'Account created successfully',
  PROFILE_UPDATED: 'Profile updated successfully',
};

// Device Types
const DEVICE_TYPES = {
  DESKTOP: 'desktop',
  MOBILE: 'mobile',
  TABLET: 'tablet',
  UNKNOWN: 'desktop', // Default
};

// Device Type Mapping from UA Parser
const DEVICE_TYPE_MAP = {
  undefined: 'desktop',
  'desktop': 'desktop',
  'notebook': 'desktop',
  'console': 'desktop',
  'smartphone': 'mobile',
  'mobile': 'mobile',
  'phone': 'mobile',
  'tablet': 'tablet',
  'smartwatch': 'mobile',
  'wearable': 'mobile',
};

// Pagination
const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100,
  MIN_LIMIT: 1,
};

// Analytics
const ANALYTICS = {
  TOP_URLS_LIMIT: 5,
  RECENT_VISITS_LIMIT: 10,
  DAILY_TREND_DAYS: 14,
  TIMEZONE: 'UTC',
};

// MongoDB
const MONGODB = {
  INDEX_CREATION_TIMEOUT: 5000,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,
};

// Security
const SECURITY = {
  BCRYPT_ROUNDS: 10,
  JWT_EXPIRATION: '7d',
  HSTS_MAX_AGE: 31536000, // 1 year
  CORS_MAX_AGE: 86400, // 24 hours
};

// API Endpoints
const API_ENDPOINTS = {
  HEALTH: '/api/health',
  AUTH: {
    SIGNUP: '/api/auth/signup',
    LOGIN: '/api/auth/login',
    PROFILE: '/api/auth/me',
  },
  URLS: {
    CREATE: '/api/urls',
    LIST: '/api/urls',
    ANALYTICS: '/api/urls/analytics',
    BULK_CREATE: '/api/urls/bulk',
    DELETE: '/api/urls/:id',
    ITEM_ANALYTICS: '/api/urls/:id/analytics',
  },
  PUBLIC: {
    STATS: '/api/public/stats/:shortCode',
  },
};

// CSV
const CSV = {
  DEFAULT_DELIMITER: ',',
  EXPECTED_HEADERS: ['longUrl', 'alias', 'expiresAt'],
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
};

// Log Levels
const LOG_LEVELS = {
  ERROR: 'error',
  WARN: 'warn',
  INFO: 'info',
  DEBUG: 'debug',
};

module.exports = {
  VALIDATION,
  RATE_LIMIT,
  HTTP_STATUS,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  DEVICE_TYPES,
  DEVICE_TYPE_MAP,
  PAGINATION,
  ANALYTICS,
  MONGODB,
  SECURITY,
  API_ENDPOINTS,
  CSV,
  LOG_LEVELS,
};
