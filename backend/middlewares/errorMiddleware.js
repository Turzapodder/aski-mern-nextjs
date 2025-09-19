import logger from "../utils/logger.js";

// 404 Not Found handler
export const notFoundHandler = (req, res, next) => {
  const message = `🔍 Route not found: ${req.method} ${req.originalUrl}`;

  logger.warn(message, {
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    userAgent: req.get("User-Agent"),
  });

  res.status(404).json({
    status: "error",
    statusCode: 404,
    message: "Route not found",
    path: req.originalUrl,
    method: req.method,
    timestamp: new Date().toISOString(),
    suggestion: "Please check the API documentation for available endpoints",
  });
};

// Global error handler
export const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log the error
  logger.logError(err, req);

  // Mongoose bad ObjectId
  if (err.name === "CastError") {
    const message = "Resource not found";
    error = {
      message,
      statusCode: 404,
      name: "CastError",
    };
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    const message = `${field} already exists`;
    error = {
      message,
      statusCode: 400,
      name: "DuplicateError",
    };
  }

  // Mongoose validation error
  if (err.name === "ValidationError") {
    const message = Object.values(err.errors)
      .map((val) => val.message)
      .join(", ");
    error = {
      message,
      statusCode: 400,
      name: "ValidationError",
    };
  }

  // JWT errors
  if (err.name === "JsonWebTokenError") {
    const message = "Invalid token";
    error = {
      message,
      statusCode: 401,
      name: "JsonWebTokenError",
    };
  }

  if (err.name === "TokenExpiredError") {
    const message = "Token expired";
    error = {
      message,
      statusCode: 401,
      name: "TokenExpiredError",
    };
  }

  // Multer file upload errors
  if (err.code === "LIMIT_FILE_SIZE") {
    const message = "File too large";
    error = {
      message,
      statusCode: 400,
      name: "FileSizeError",
    };
  }

  // Rate limit error
  if (err.status === 429) {
    const message = "Too many requests, please try again later";
    error = {
      message,
      statusCode: 429,
      name: "RateLimitError",
    };
  }

  const statusCode = error.statusCode || err.statusCode || 500;
  const message = error.message || "Internal Server Error";

  const errorResponse = {
    status: "error",
    statusCode,
    message,
    ...(process.env.NODE_ENV === "development" && {
      stack: err.stack,
      error: err,
    }),
    timestamp: new Date().toISOString(),
    path: req.originalUrl,
    method: req.method,
    ip: req.ip,
  };

  // Different log levels based on status code
  if (statusCode >= 500) {
    logger.error(`💥 Server Error ${statusCode}: ${message}`, {
      error: err,
      request: {
        method: req.method,
        url: req.originalUrl,
        ip: req.ip,
        userAgent: req.get("User-Agent"),
        body: req.body,
      },
    });
  } else if (statusCode >= 400) {
    logger.warn(`⚠️ Client Error ${statusCode}: ${message}`, {
      request: {
        method: req.method,
        url: req.originalUrl,
        ip: req.ip,
      },
    });
  }

  res.status(statusCode).json(errorResponse);
};

// Async error wrapper to catch async errors
export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Custom error class
export class AppError extends Error {
  constructor(message, statusCode = 500, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";
    this.isOperational = isOperational;

    Error.captureStackTrace(this, this.constructor);
  }
}

// Validation error handler
export const handleValidationError = (validationResult) => {
  return (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const errorMessages = errors.array().map((error) => ({
        field: error.param,
        message: error.msg,
        value: error.value,
      }));

      logger.warn("❌ Validation Error", {
        errors: errorMessages,
        request: {
          method: req.method,
          url: req.originalUrl,
          body: req.body,
          ip: req.ip,
        },
      });

      return res.status(400).json({
        status: "error",
        statusCode: 400,
        message: "Validation failed",
        errors: errorMessages,
        timestamp: new Date().toISOString(),
      });
    }
    next();
  };
};
