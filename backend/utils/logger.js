import winston from "winston";
import chalk from "chalk";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define log colors
const logColors = {
  error: "red",
  warn: "yellow",
  info: "green",
  http: "magenta",
  verbose: "cyan",
  debug: "blue",
  silly: "gray",
};

// Add colors to winston
winston.addColors(logColors);

// Create logs directory path
const logsDir = path.join(path.dirname(__dirname), "logs");

// Custom format for console output with colors and emojis
const consoleFormat = winston.format.combine(
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  winston.format.errors({ stack: true }),
  winston.format.printf(({ level, message, timestamp, stack }) => {
    const colors = {
      error: chalk.red,
      warn: chalk.yellow,
      info: chalk.green,
      http: chalk.magenta,
      verbose: chalk.cyan,
      debug: chalk.blue,
      silly: chalk.gray,
    };

    const emojis = {
      error: "❌",
      warn: "⚠️",
      info: "ℹ️",
      http: "🌐",
      verbose: "📝",
      debug: "🐛",
      silly: "🤪",
    };

    const colorFn = colors[level] || chalk.white;
    const emoji = emojis[level] || "📋";

    if (stack) {
      return `${chalk.gray(timestamp)} ${emoji} ${colorFn(
        level.toUpperCase()
      )}: ${message}\n${chalk.red(stack)}`;
    }

    return `${chalk.gray(timestamp)} ${emoji} ${colorFn(
      level.toUpperCase()
    )}: ${message}`;
  })
);

// File format without colors
const fileFormat = winston.format.combine(
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

// Create the logger
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || "info",
  format: fileFormat,
  defaultMeta: {
    service: "mern-server",
    environment: process.env.NODE_ENV || "development",
  },
  transports: [
    // Error log file
    new winston.transports.File({
      filename: path.join(logsDir, "error.log"),
      level: "error",
      maxsize: 5242880, // 5MB
      maxFiles: 5,
      format: fileFormat,
    }),

    // Combined log file
    new winston.transports.File({
      filename: path.join(logsDir, "combined.log"),
      maxsize: 5242880, // 5MB
      maxFiles: 10,
      format: fileFormat,
    }),

    // Daily rotate file for access logs
    new winston.transports.File({
      filename: path.join(logsDir, "access.log"),
      level: "http",
      maxsize: 5242880, // 5MB
      maxFiles: 7,
      format: fileFormat,
    }),
  ],
  exceptionHandlers: [
    new winston.transports.File({
      filename: path.join(logsDir, "exceptions.log"),
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
  ],
  rejectionHandlers: [
    new winston.transports.File({
      filename: path.join(logsDir, "rejections.log"),
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
  ],
});

// Add console transport for non-production environments
if (process.env.NODE_ENV !== "production") {
  logger.add(
    new winston.transports.Console({
      format: consoleFormat,
      level: "debug",
    })
  );
} else {
  // In production, still show important logs in console
  logger.add(
    new winston.transports.Console({
      format: consoleFormat,
      level: "info",
    })
  );
}

// Create a stream object for Morgan integration
logger.stream = {
  write: (message) => {
    logger.http(message.trim());
  },
};

// Helper methods for structured logging
logger.logRequest = (req, message = "Request received") => {
  logger.http(`${message} - ${req.method} ${req.url}`, {
    method: req.method,
    url: req.url,
    ip: req.ip,
    userAgent: req.get("User-Agent"),
    timestamp: new Date().toISOString(),
  });
};

logger.logResponse = (req, res, message = "Response sent") => {
  logger.http(`${message} - ${req.method} ${req.url} ${res.statusCode}`, {
    method: req.method,
    url: req.url,
    statusCode: res.statusCode,
    ip: req.ip,
    responseTime: res.get("X-Response-Time"),
    timestamp: new Date().toISOString(),
  });
};

logger.logError = (error, req = null) => {
  const errorData = {
    message: error.message,
    stack: error.stack,
    timestamp: new Date().toISOString(),
  };

  if (req) {
    errorData.request = {
      method: req.method,
      url: req.url,
      ip: req.ip,
      userAgent: req.get("User-Agent"),
    };
  }

  logger.error("Application Error", errorData);
};

logger.logDatabase = (operation, collection, details = {}) => {
  logger.info(`Database ${operation} - ${collection}`, {
    operation,
    collection,
    ...details,
    timestamp: new Date().toISOString(),
  });
};

logger.logAuth = (event, user, details = {}) => {
  logger.info(`Auth Event: ${event}`, {
    event,
    userId: user?.id || user?._id,
    email: user?.email,
    ...details,
    timestamp: new Date().toISOString(),
  });
};

export default logger;
