// ========================================
// Logger Utility - Production-ready logging
// ========================================

const { LOG_LEVELS } = require('../config/constants');

// ANSI color codes for terminal output
const COLORS = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  green: '\x1b[32m',
  blue: '\x1b[34m',
  gray: '\x1b[90m',
};

class Logger {
  constructor(context = 'App') {
    this.context = context;
    this.logLevel = process.env.LOG_LEVEL || LOG_LEVELS.INFO;
    this.isDevelopment = process.env.NODE_ENV === 'development';
  }

  /**
   * Format timestamp in ISO format
   * @returns {string} Current timestamp
   */
  getTimestamp() {
    return new Date().toISOString();
  }

  /**
   * Format log message with context and timestamp
   * @param {string} level - Log level
   * @param {string} message - Log message
   * @param {any} data - Additional data to log
   * @returns {object} Formatted log object
   */
  formatLogEntry(level, message, data = null) {
    const entry = {
      timestamp: this.getTimestamp(),
      level: level.toUpperCase(),
      context: this.context,
      message,
    };

    if (data) {
      entry.data = this.sanitizeData(data);
    }

    return entry;
  }

  /**
   * Sanitize sensitive data from logs
   * @param {any} data - Data to sanitize
   * @returns {any} Sanitized data
   */
  sanitizeData(data) {
    if (!data || typeof data !== 'object') {
      return data;
    }

    const sanitized = { ...data };
    const sensitiveKeys = ['password', 'passwordHash', 'token', 'secret', 'apiKey', 'jwt'];

    const sanitizeObject = (obj) => {
      Object.keys(obj).forEach((key) => {
        if (sensitiveKeys.some((sensitive) => key.toLowerCase().includes(sensitive))) {
          obj[key] = '[REDACTED]';
        } else if (typeof obj[key] === 'object' && obj[key] !== null) {
          sanitizeObject(obj[key]);
        }
      });
    };

    sanitizeObject(sanitized);
    return sanitized;
  }

  /**
   * Get color for log level in terminal output
   * @param {string} level - Log level
   * @returns {string} ANSI color code
   */
  getColorForLevel(level) {
    switch (level.toLowerCase()) {
      case LOG_LEVELS.ERROR:
        return COLORS.red;
      case LOG_LEVELS.WARN:
        return COLORS.yellow;
      case LOG_LEVELS.INFO:
        return COLORS.green;
      case LOG_LEVELS.DEBUG:
        return COLORS.blue;
      default:
        return COLORS.gray;
    }
  }

  /**
   * Output formatted message to console
   * @param {object} entry - Formatted log entry
   */
  outputToConsole(entry) {
    const color = this.getColorForLevel(entry.level);
    const timestamp = `${COLORS.gray}${entry.timestamp}${COLORS.reset}`;
    const level = `${color}[${entry.level}]${COLORS.reset}`;
    const context = `${COLORS.blue}${entry.context}${COLORS.reset}`;

    let message = `${timestamp} ${level} ${context}: ${entry.message}`;

    if (this.isDevelopment && entry.data) {
      message += `\n${JSON.stringify(entry.data, null, 2)}`;
    }

    console.log(message);
  }

  /**
   * Output JSON log entry (suitable for log aggregation services)
   * @param {object} entry - Formatted log entry
   */
  outputJSON(entry) {
    console.log(JSON.stringify(entry));
  }

  /**
   * Determine if message should be logged based on log level
   * @param {string} requestedLevel - Requested log level
   * @returns {boolean} Should log
   */
  shouldLog(requestedLevel) {
    const levels = [LOG_LEVELS.ERROR, LOG_LEVELS.WARN, LOG_LEVELS.INFO, LOG_LEVELS.DEBUG];
    const currentLevelIndex = levels.indexOf(this.logLevel);
    const requestedLevelIndex = levels.indexOf(requestedLevel);

    return requestedLevelIndex <= currentLevelIndex;
  }

  /**
   * Log error message
   * @param {string} message - Error message
   * @param {Error|object} error - Error object or data
   */
  error(message, error = null) {
    if (this.shouldLog(LOG_LEVELS.ERROR)) {
      const entry = this.formatLogEntry(LOG_LEVELS.ERROR, message, error);
      if (this.isDevelopment) {
        this.outputToConsole(entry);
      } else {
        this.outputJSON(entry);
      }
    }
  }

  /**
   * Log warning message
   * @param {string} message - Warning message
   * @param {object} data - Additional data
   */
  warn(message, data = null) {
    if (this.shouldLog(LOG_LEVELS.WARN)) {
      const entry = this.formatLogEntry(LOG_LEVELS.WARN, message, data);
      if (this.isDevelopment) {
        this.outputToConsole(entry);
      } else {
        this.outputJSON(entry);
      }
    }
  }

  /**
   * Log info message
   * @param {string} message - Info message
   * @param {object} data - Additional data
   */
  info(message, data = null) {
    if (this.shouldLog(LOG_LEVELS.INFO)) {
      const entry = this.formatLogEntry(LOG_LEVELS.INFO, message, data);
      if (this.isDevelopment) {
        this.outputToConsole(entry);
      } else {
        this.outputJSON(entry);
      }
    }
  }

  /**
   * Log debug message
   * @param {string} message - Debug message
   * @param {object} data - Additional data
   */
  debug(message, data = null) {
    if (this.shouldLog(LOG_LEVELS.DEBUG)) {
      const entry = this.formatLogEntry(LOG_LEVELS.DEBUG, message, data);
      if (this.isDevelopment) {
        this.outputToConsole(entry);
      } else {
        this.outputJSON(entry);
      }
    }
  }

  /**
   * Log HTTP request
   * @param {object} req - Express request object
   * @param {object} req - Express response object
   */
  httpRequest(req, res = null) {
    const method = req.method;
    const path = req.path;
    const ip = req.ip || req.connection.remoteAddress;
    const message = `${method} ${path}`;

    const data = {
      method,
      path,
      ip,
      ...(res && { statusCode: res.statusCode }),
    };

    this.info(message, data);
  }

  /**
   * Log database operation
   * @param {string} operation - Operation name (find, insert, update, delete)
   * @param {string} collection - Collection name
   * @param {object} query - Query object
   * @param {number} duration - Operation duration in ms
   */
  database(operation, collection, query = null, duration = null) {
    const message = `[${collection}] ${operation}`;
    const data = {};

    if (query) {
      data.query = this.sanitizeData(query);
    }
    if (duration) {
      data.duration_ms = duration;
    }

    this.debug(message, Object.keys(data).length > 0 ? data : null);
  }

  /**
   * Create a child logger with different context
   * @param {string} context - New context name
   * @returns {Logger} New logger instance
   */
  child(context) {
    const child = new Logger(context);
    child.logLevel = this.logLevel;
    return child;
  }
}

// Export singleton instance
module.exports = new Logger('Bytelink');

// Also export class for creating contextual loggers
module.exports.Logger = Logger;
