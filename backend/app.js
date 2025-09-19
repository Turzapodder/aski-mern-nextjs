import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { createServer } from "http";
import path from "path";
import { fileURLToPath } from "url";
import chalk from "chalk";
import figlet from "figlet";
import morgan from "morgan";
import helmet from "helmet";
import compression from "compression";
import rateLimit from "express-rate-limit";
import connectDB from "./config/connectdb.js";
import passport from "passport";
import userRoutes from "./routes/userRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import socketManager from "./config/socket.js";
import "./config/passport-jwt-strategy.js";
import setTokensCookies from "./utils/setTokensCookies.js";
import "./config/google-strategy.js";
import logger from "./utils/logger.js";
import {
  errorHandler,
  notFoundHandler,
} from "./middlewares/errorMiddleware.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = createServer(app);
const port = process.env.PORT || 5000;
const ipAddress = process.env.IP_ADDRESS || "127.0.0.1";
const DATABASE_URL = process.env.DATABASE_URL;

// Display startup banner
console.log(
  chalk.cyan(
    figlet.textSync("N A Y O N", {
      font: "Small",
      horizontalLayout: "default",
      verticalLayout: "default",
    })
  )
);

console.log(chalk.green("🚀 Starting MERN Stack Server..."));
console.log(
  chalk.blue(`📡 Environment: ${process.env.NODE_ENV || "development"}`)
);
console.log(chalk.yellow(`🌐 IP Address: ${ipAddress}`));
console.log(chalk.magenta(`🔌 Port: ${port}`));

// Trust proxy for accurate IP addresses
app.set("trust proxy", 1);

// Security middleware
app.use(
  helmet({
    crossOriginEmbedderPolicy: false,
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
      },
    },
  })
);

// Compression middleware
app.use(compression());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // limit each IP to 1000 requests per windowMs
  message: {
    error: "Too many requests from this IP, please try again later.",
    retryAfter: "15 minutes",
  },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// CORS configuration
const corsOptions = {
  origin: process.env.FRONTEND_HOST || "http://localhost:3000",
  optionsSuccessStatus: 200,
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
};

app.use(cors(corsOptions));

// Custom Morgan logging format with colors
morgan.token("colorStatus", (req, res) => {
  const status = res.statusCode;
  if (status >= 500) return chalk.red(status);
  if (status >= 400) return chalk.yellow(status);
  if (status >= 300) return chalk.cyan(status);
  if (status >= 200) return chalk.green(status);
  return chalk.white(status);
});

morgan.token("colorMethod", (req) => {
  const method = req.method;
  switch (method) {
    case "GET":
      return chalk.green(method);
    case "POST":
      return chalk.blue(method);
    case "PUT":
      return chalk.yellow(method);
    case "DELETE":
      return chalk.red(method);
    case "PATCH":
      return chalk.magenta(method);
    default:
      return chalk.white(method);
  }
});

morgan.token("realIp", (req) => {
  return (
    req.ip ||
    req.connection.remoteAddress ||
    req.socket.remoteAddress ||
    "unknown"
  );
});

morgan.token("userAgent", (req) => {
  return req.get("User-Agent") || "unknown";
});

const morganFormat =
  chalk.gray(":date[iso]") +
  " " +
  ":colorMethod :url " +
  ":colorStatus " +
  chalk.cyan(":response-time ms") +
  " " +
  chalk.gray("IP: :realIp") +
  " " +
  chalk.dim('":userAgent"');

app.use(
  morgan(morganFormat, {
    stream: {
      write: (message) => {
        logger.info(message.trim());
      },
    },
  })
);

// Connect to database
connectDB(DATABASE_URL);

// Body parsing middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Cookie parser
app.use(cookieParser());

// Passport initialization
app.use(passport.initialize());

// Serve uploaded files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Health check endpoints
app.get("/", (req, res) => {
  const uptime = process.uptime();
  const uptimeString = `${Math.floor(uptime / 3600)}h ${Math.floor(
    (uptime % 3600) / 60
  )}m ${Math.floor(uptime % 60)}s`;

  res.json({
    status: "success",
    message: "MERN Stack Server is running successfully! 🚀",
    timestamp: new Date().toISOString(),
    uptime: uptimeString,
    environment: process.env.NODE_ENV || "development",
    version: process.env.npm_package_version || "1.0.0",
    nodeVersion: process.version,
    platform: process.platform,
    architecture: process.arch,
    memoryUsage: {
      rss: `${Math.round(process.memoryUsage().rss / 1024 / 1024)} MB`,
      heapTotal: `${Math.round(
        process.memoryUsage().heapTotal / 1024 / 1024
      )} MB`,
      heapUsed: `${Math.round(
        process.memoryUsage().heapUsed / 1024 / 1024
      )} MB`,
      external: `${Math.round(
        process.memoryUsage().external / 1024 / 1024
      )} MB`,
    },
  });
});

app.get("/health", (req, res) => {
  res.status(200).json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || "development",
  });
});

app.get("/api", (req, res) => {
  res.json({
    status: "success",
    message: "API is working correctly",
    version: "v1",
    endpoints: {
      users: "/api/user",
      chat: "/api/chat",
      health: "/health",
      root: "/",
    },
  });
});

// Load application routes
app.use("/api/user", userRoutes);
app.use("/api/chat", chatRoutes);

// Google OAuth routes with enhanced logging
app.get("/auth/google", (req, res, next) => {
  const role = req.query.role || "";
  const userIp = req.ip;

  logger.info(
    `🔐 Google OAuth initiated - IP: ${userIp}, Role: ${role || "default"}`
  );

  const authOptions = {
    session: false,
    scope: ["profile", "email"],
    state: role,
  };

  passport.authenticate("google", authOptions)(req, res, next);
});

app.get(
  "/auth/google/callback",
  passport.authenticate("google", {
    session: false,
    failureRedirect: `${process.env.FRONTEND_HOST}/account/login`,
  }),
  (req, res) => {
    const {
      user,
      accessToken,
      refreshToken,
      accessTokenExp,
      refreshTokenExp,
      isNewTutor,
    } = req.user;
    const userIp = req.ip;

    logger.info(
      `✅ Google OAuth success - User: ${user.email}, IP: ${userIp}, New Tutor: ${isNewTutor}`
    );

    setTokensCookies(
      res,
      accessToken,
      refreshToken,
      accessTokenExp,
      refreshTokenExp,
      user
    );

    if (
      (user.roles.includes("tutor") && user.onboardingStatus === "pending") ||
      isNewTutor
    ) {
      res.redirect(`${process.env.FRONTEND_HOST}/account/tutor-onboarding`);
    } else {
      res.redirect(`${process.env.FRONTEND_HOST}/user/profile`);
    }
  }
);

// 404 handler - must be after all routes
app.use(notFoundHandler);

// Global error handler - must be last
app.use(errorHandler);

// Graceful shutdown handlers
const gracefulShutdown = (signal) => {
  logger.info(`📴 Received ${signal}. Starting graceful shutdown...`);

  server.close(() => {
    logger.info("🛑 HTTP server closed");

    // Close database connections, cleanup resources, etc.
    process.exit(0);
  });

  // Force close after 30 seconds
  setTimeout(() => {
    logger.error(
      "⚠️ Could not close connections in time, forcefully shutting down"
    );
    process.exit(1);
  }, 30000);
};

// Handle different termination signals
process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));

// Handle unhandled promise rejections
process.on("unhandledRejection", (err) => {
  logger.error(`❌ Unhandled Promise Rejection: ${err.message}`, err);
  gracefulShutdown("unhandledRejection");
});

// Handle uncaught exceptions
process.on("uncaughtException", (err) => {
  logger.error(`💥 Uncaught Exception: ${err.message}`, err);
  gracefulShutdown("uncaughtException");
});

// Initialize Socket.IO
socketManager.initialize(server);

// Start the server
server.listen(port, ipAddress, () => {
  console.log("\n" + "=".repeat(60));
  console.log(chalk.green.bold("✅ SERVER SUCCESSFULLY STARTED"));
  console.log("=".repeat(60));
  console.log(chalk.cyan(`🌐 Server running on: http://${ipAddress}:${port}`));
  console.log(
    chalk.yellow(`📊 Health check: http://${ipAddress}:${port}/health`)
  );
  console.log(chalk.magenta(`🔌 Socket.IO ready for real-time communication`));
  console.log(chalk.blue(`📱 API endpoints: http://${ipAddress}:${port}/api`));
  console.log(chalk.gray(`🕒 Started at: ${new Date().toLocaleString()}`));
  console.log("=".repeat(60) + "\n");

  logger.info(`🚀 Server successfully started on ${ipAddress}:${port}`);
  logger.info(`📡 Environment: ${process.env.NODE_ENV || "development"}`);
  logger.info(`🔌 Socket.IO initialized and ready`);
});

export default app;
