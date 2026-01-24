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
import tutorRoutes from "./routes/tutorRoutes.js";
import studentRoutes from "./routes/studentRoutes.js";
import profileRoutes from "./routes/profileRoutes.js";
import assignmentRoutes from "./routes/assignmentRoutes.js";
import proposalRoutes from "./routes/proposalRoutes.js";
import tutorsRoutes from "./routes/tutorsRoutes.js";
import sessionsRoutes from "./routes/sessionsRoutes.js";
import walletRoutes from "./routes/walletRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import customOfferRoutes from "./routes/customOfferRoutes.js";
import reportRoutes from "./routes/reportRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
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

let server;
let isShuttingDown = false;

// Auto-restart configuration
const MAX_RESTART_ATTEMPTS = 5;
let restartAttempts = 0;
let lastRestartTime = 0;
const RESTART_COOLDOWN = 5000; // 5 seconds cooldown between restarts

const startServer = async () => {
  try {
    const app = express();
    const port = process.env.PORT || 5000;
    const ipAddress = process.env.IP_ADDRESS || "127.0.0.1";
    const DATABASE_URL = process.env.DATABASE_URL;

    // Reset restart attempts on successful start after cooldown
    const now = Date.now();
    if (now - lastRestartTime > 60000) {
      // 1 minute cooldown
      restartAttempts = 0;
    }

    // Display startup banner
    console.log(
      chalk.cyan(
        figlet.textSync("A S K I", {
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

    if (restartAttempts > 0) {
      console.log(
        chalk.yellow(
          `🔄 Restart attempt: ${restartAttempts}/${MAX_RESTART_ATTEMPTS}`
        )
      );
    }

    // Trust proxy for accurate IP addresses
    app.set("trust proxy", 1);

    // Security middleware with enhanced error handling - FIXED FOR CORS
    app.use(
      helmet({
        crossOriginEmbedderPolicy: false,
        crossOriginResourcePolicy: { policy: "cross-origin" },
        contentSecurityPolicy: {
          directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'"],
            imgSrc: ["'self'", "data:", "https:", "http:"],
          },
        },
      })
    );

    // Compression middleware
    app.use(compression());

    // Enhanced rate limiting with better error handling
    const limiter = rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 1000, // limit each IP to 1000 requests per windowMs
      message: {
        error: "Too many requests from this IP, please try again later.",
        retryAfter: "15 minutes",
      },
      standardHeaders: true,
      legacyHeaders: false,
      skip: (req, res) => {
        // Skip rate limiting for health checks and socket connections
        return (
          req.path === "/health" ||
          req.path === "/" ||
          req.path.includes("/socket.io/")
        );
      },
      handler: (req, res) => {
        logger.warn(`Rate limit exceeded for IP: ${req.ip}`);
        res.status(429).json({
          error: "Too many requests from this IP, please try again later.",
          retryAfter: "15 minutes",
        });
      },
    });
    app.use(limiter);

    // CORS configuration - Enhanced for Socket.IO
    const corsOptions = {
      origin: [
        process.env.FRONTEND_HOST || "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:3000",
      ],
      optionsSuccessStatus: 200,
      credentials: true,
      methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
      allowedHeaders: [
        "Content-Type",
        "Authorization",
        "X-Requested-With",
        "Accept",
        "Origin",
        "Access-Control-Request-Method",
        "Access-Control-Request-Headers",
      ],
    };

    app.use(cors(corsOptions));

    // Custom Morgan logging format with colors and error handling
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
        req.connection?.remoteAddress ||
        req.socket?.remoteAddress ||
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
            try {
              logger.info(message.trim());
            } catch (error) {
              console.error("Morgan logging error:", error.message);
            }
          },
        },
        skip: (req, res) => {
          // Skip logging for health checks and socket.io polling to reduce noise
          return req.path === "/health" || req.path.includes("/socket.io/");
        },
      })
    );

    // Connect to database with retry logic
    await connectDB(DATABASE_URL);

    // Body parsing middleware with enhanced limits and error handling
    app.use(
      express.json({
        limit: "10mb",
        verify: (req, res, buf) => {
          try {
            JSON.parse(buf);
          } catch (e) {
            res.status(400).json({ error: "Invalid JSON payload" });
            throw new Error("Invalid JSON");
          }
        },
      })
    );

    app.use(
      express.urlencoded({
        extended: true,
        limit: "10mb",
        verify: (req, res, buf) => {
          // Basic validation for URL encoded data
          if (buf.length === 0) {
            throw new Error("Empty request body");
          }
        },
      })
    );

    // Cookie parser with error handling
    app.use(cookieParser());

    // Passport initialization
    app.use(passport.initialize());

    // Create HTTP server BEFORE routes
    server = createServer(app);

    // Initialize Socket.IO with the HTTP server
    try {
      const io = socketManager.initialize(server);
      logger.info("Socket.IO initialized successfully");

      // Make socket manager available to routes
      app.set("socketManager", socketManager);
      app.set("io", io);
    } catch (socketError) {
      logger.error("Socket.IO initialization error:", socketError);
      // Don't fail the server start for socket errors in development
      if (process.env.NODE_ENV === "production") {
        throw socketError;
      }
    }

    // FIXED: Custom CORS middleware for uploaded files
    app.use("/uploads", (req, res, next) => {
      const allowedOrigins = [
        process.env.FRONTEND_HOST || "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:3000",
      ];

      next();
    });

    // Serve uploaded files with error handling
    app.use(
      "/uploads",
      express.static(path.join(__dirname, "uploads"), {
        maxAge: "1d",
        etag: false,
        setHeaders: (res, filepath) => {
          res.setHeader("Cache-Control", "public, max-age=86400");
        },
      })
    );

    // Enhanced health check endpoints
    app.get("/", (req, res) => {
      try {
        const uptime = process.uptime();
        const uptimeString = `${Math.floor(uptime / 3600)}h ${Math.floor(
          (uptime % 3600) / 60
        )}m ${Math.floor(uptime % 60)}s`;

        const socketStats = socketManager ? socketManager.getStats() : null;

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
          restartAttempts,
          socketIO: {
            initialized: !!socketManager.io,
            stats: socketStats,
          },
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
      } catch (error) {
        logger.error("Health check error:", error);
        res.status(500).json({
          status: "error",
          message: "Health check failed",
          error: error.message,
        });
      }
    });

    app.get("/health", (req, res) => {
      try {
        const socketStats = socketManager ? socketManager.getStats() : null;

        res.status(200).json({
          status: "healthy",
          timestamp: new Date().toISOString(),
          uptime: process.uptime(),
          environment: process.env.NODE_ENV || "development",
          restartAttempts,
          pid: process.pid,
          socketIO: {
            status: socketManager?.io ? "connected" : "disconnected",
            stats: socketStats,
          },
        });
      } catch (error) {
        res.status(500).json({
          status: "unhealthy",
          error: error.message,
        });
      }
    });

    app.get("/api", (req, res) => {
      try {
        res.json({
          status: "success",
          message: "API is working correctly",
          version: "v1",
          socketIO: {
            enabled: !!socketManager.io,
            endpoint: "/socket.io/",
          },
          endpoints: {
            users: "/api/user",
            chat: "/api/chat",
            tutors: "/api/tutor",
            students: "/api/student",
            health: "/health",
            root: "/",
          },
        });
      } catch (error) {
        res.status(500).json({
          status: "error",
          message: "API endpoint error",
          error: error.message,
        });
      }
    });

    // Load application routes with error boundaries
    app.use("/api/user", userRoutes);
    app.use("/api/chat", chatRoutes);
    app.use("/api/tutor", tutorRoutes);
    app.use("/api/student", studentRoutes);
    app.use("/api/profile", profileRoutes);
    app.use("/api/assignments", assignmentRoutes);
    app.use("/api/proposals", proposalRoutes);
    app.use("/api/custom-offers", customOfferRoutes);
    app.use("/api/reports", reportRoutes);
    app.use("/api/notifications", notificationRoutes);
    app.use("/api/tutors", tutorsRoutes);
    app.use("/api/sessions", sessionsRoutes);
    app.use("/api/wallet", walletRoutes);
    app.use("/api/v1/admin", adminRoutes);

    // Google OAuth routes with enhanced error handling and logging
    app.get("/auth/google", (req, res, next) => {
      try {
        const role = req.query.role || "";
        const userIp = req.ip;

        logger.info(
          `🔐 Google OAuth initiated - IP: ${userIp}, Role: ${
            role || "default"
          }`
        );

        const authOptions = {
          session: false,
          scope: ["profile", "email"],
          state: role,
        };

        passport.authenticate("google", authOptions)(req, res, next);
      } catch (error) {
        logger.error("Google OAuth initiation error:", error);
        res.redirect(
          `${process.env.FRONTEND_HOST}/account/login?error=oauth_init_failed`
        );
      }
    });

    app.get(
      "/auth/google/callback",
      (req, res, next) => {
        passport.authenticate("google", {
          session: false,
          failureRedirect: `${process.env.FRONTEND_HOST}/account/login?error=oauth_failed`,
        })(req, res, next);
      },
      (req, res) => {
        try {
          if (!req.user) {
            logger.error("Google OAuth callback: No user data received");
            return res.redirect(
              `${process.env.FRONTEND_HOST}/account/login?error=no_user_data`
            );
          }

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
            `✅ Google OAuth success - User: ${
              user?.email || "unknown"
            }, IP: ${userIp}, New Tutor: ${isNewTutor}`
          );

          // Check if response headers have already been sent
          if (res.headersSent) {
            logger.warn("Headers already sent in Google OAuth callback");
            return;
          }

          setTokensCookies(
            res,
            accessToken,
            refreshToken,
            accessTokenExp,
            refreshTokenExp,
            user
          );

          if (
            (user.roles?.includes("tutor") &&
              user.onboardingStatus === "pending") ||
            isNewTutor
          ) {
            res.redirect(
              `${process.env.FRONTEND_HOST}/account/tutor-onboarding`
            );
          } else {
            res.redirect(`${process.env.FRONTEND_HOST}/user/dashboard`);
          }
        } catch (error) {
          logger.error("Google OAuth callback error:", error);
          if (!res.headersSent) {
            res.redirect(
              `${process.env.FRONTEND_HOST}/account/login?error=callback_failed`
            );
          }
        }
      }
    );

    // 404 handler - must be after all routes
    app.use(notFoundHandler);

    // Enhanced global error handler - must be last
    app.use((error, req, res, next) => {
      try {
        // Check if headers have already been sent
        if (res.headersSent) {
          logger.error("Error occurred after headers sent:", error.message);
          return next(error);
        }

        logger.error("Global error handler:", {
          message: error.message,
          stack: error.stack,
          url: req.url,
          method: req.method,
          ip: req.ip,
        });

        // Call the original error handler
        errorHandler(error, req, res, next);
      } catch (handlerError) {
        logger.error("Error in error handler:", handlerError);
        if (!res.headersSent) {
          res.status(500).json({
            status: "error",
            message: "Internal server error",
          });
        }
      }
    });

    // Start the server with promise handling
    return new Promise((resolve, reject) => {
      const serverInstance = server.listen(port, ipAddress, (error) => {
        if (error) {
          reject(error);
          return;
        }

        console.log("\n" + "=".repeat(60));
        console.log(chalk.green.bold("✅ SERVER SUCCESSFULLY STARTED"));
        console.log("=".repeat(60));
        console.log(
          chalk.cyan(`🌐 Server running on: http://${ipAddress}:${port}`)
        );
        console.log(
          chalk.yellow(`📊 Health check: http://${ipAddress}:${port}/health`)
        );
        console.log(
          chalk.magenta(`🔌 Socket.IO ready for real-time communication`)
        );
        console.log(
          chalk.blue(`📱 API endpoints: http://${ipAddress}:${port}/api`)
        );
        console.log(
          chalk.gray(`🕒 Started at: ${new Date().toLocaleString()}`)
        );
        if (restartAttempts > 0) {
          console.log(
            chalk.green(
              `🔄 Successfully restarted after ${restartAttempts} attempts`
            )
          );
        }
        console.log("=".repeat(60) + "\n");

        logger.info(`🚀 Server successfully started on ${ipAddress}:${port}`);
        logger.info(`📡 Environment: ${process.env.NODE_ENV || "development"}`);
        logger.info(`🔌 Socket.IO initialized and ready`);
        logger.info(`🆔 Process ID: ${process.pid}`);

        resolve(serverInstance);
      });

      // Handle server errors
      serverInstance.on("error", (error) => {
        logger.error("Server error:", error);
        reject(error);
      });

      // Set server timeout to prevent hanging requests
      serverInstance.timeout = 30000; // 30 seconds
    });
  } catch (error) {
    logger.error("Server startup error:", error);
    throw error;
  }
};

// Enhanced graceful shutdown function
const gracefulShutdown = async (signal, exitCode = 0) => {
  if (isShuttingDown) {
    logger.warn(`Shutdown already in progress, ignoring ${signal}`);
    return;
  }

  isShuttingDown = true;
  logger.info(`📴 Received ${signal}. Starting graceful shutdown...`);

  try {
    // Close Socket.IO connections first
    if (socketManager) {
      try {
        await socketManager.close();
        logger.info("🔌 Socket.IO connections closed");
      } catch (socketError) {
        logger.error("Error closing Socket.IO:", socketError);
      }
    }

    // Stop accepting new connections
    if (server) {
      server.close((err) => {
        if (err) {
          logger.error("Error closing HTTP server:", err);
        } else {
          logger.info("🛑 HTTP server closed");
        }
      });
    }

    // Give time for cleanup
    await new Promise((resolve) => setTimeout(resolve, 2000));

    logger.info("✅ Graceful shutdown completed");
    process.exit(exitCode);
  } catch (error) {
    logger.error("Error during graceful shutdown:", error);
    process.exit(1);
  }
};

// Auto-restart function
const restartServer = async (reason = "unknown") => {
  const now = Date.now();

  // Prevent restart if we're already shutting down
  if (isShuttingDown) {
    logger.info("Shutdown in progress, skipping restart");
    return;
  }

  // Check restart cooldown
  if (now - lastRestartTime < RESTART_COOLDOWN) {
    logger.warn(
      `Restart cooldown active, skipping restart (reason: ${reason})`
    );
    return;
  }

  restartAttempts++;
  lastRestartTime = now;

  logger.info(
    `🔄 Attempting to restart server (attempt ${restartAttempts}/${MAX_RESTART_ATTEMPTS}) - Reason: ${reason}`
  );

  // Check if we've exceeded maximum restart attempts
  if (restartAttempts > MAX_RESTART_ATTEMPTS) {
    logger.error(
      `❌ Maximum restart attempts (${MAX_RESTART_ATTEMPTS}) exceeded. Manual intervention required.`
    );
    process.exit(1);
    return;
  }

  try {
    // Close Socket.IO first
    if (socketManager) {
      try {
        await socketManager.close();
      } catch (socketError) {
        logger.error("Error closing Socket.IO during restart:", socketError);
      }
    }

    // Close existing server if it exists
    if (server) {
      try {
        server.close();
        await new Promise((resolve) => setTimeout(resolve, 1000));
      } catch (closeError) {
        logger.error("Error closing server during restart:", closeError);
      }
    }

    // Reset shutdown flag
    isShuttingDown = false;

    // Start new server instance
    await startServer();

    logger.info(
      `✅ Server restarted successfully (attempt ${restartAttempts})`
    );
  } catch (error) {
    logger.error(
      `❌ Failed to restart server (attempt ${restartAttempts}):`,
      error
    );

    // Wait before next restart attempt
    setTimeout(() => {
      restartServer(`restart_failed_${restartAttempts}`);
    }, RESTART_COOLDOWN);
  }
};

// Process event handlers with auto-restart
process.on("SIGTERM", () => gracefulShutdown("SIGTERM", 0));
process.on("SIGINT", () => gracefulShutdown("SIGINT", 0));

// Handle unhandled promise rejections with restart
process.on("unhandledRejection", async (err, promise) => {
  logger.error(`❌ Unhandled Promise Rejection at:`, promise, `reason:`, err);
  logger.error(`Stack trace:`, err.stack);

  // Don't restart for headers already sent errors in development
  if (
    err.message &&
    err.message.includes("Cannot set headers after they are sent")
  ) {
    logger.warn("Headers already sent error detected, attempting restart...");
    setTimeout(() => {
      restartServer("headers_already_sent");
    }, 1000);
  } else {
    setTimeout(() => {
      restartServer("unhandled_promise_rejection");
    }, 1000);
  }
});

// Handle uncaught exceptions with restart
process.on("uncaughtException", async (err) => {
  logger.error(`💥 Uncaught Exception:`, err);
  logger.error(`Stack trace:`, err.stack);

  setTimeout(() => {
    restartServer("uncaught_exception");
  }, 1000);
});

// Handle process warnings
process.on("warning", (warning) => {
  logger.warn(`⚠️ Process Warning:`, {
    name: warning.name,
    message: warning.message,
    stack: warning.stack,
  });
});

// Monitor memory usage and restart if needed
const monitorMemory = () => {
  const usage = process.memoryUsage();
  const usedMB = Math.round(usage.heapUsed / 1024 / 1024);
  const totalMB = Math.round(usage.heapTotal / 1024 / 1024);

  // Log memory usage every 10 minutes
  if (Date.now() % (10 * 60 * 1000) < 1000) {
    logger.info(`📊 Memory usage: ${usedMB}MB / ${totalMB}MB`);

    // Log Socket.IO stats if available
    if (socketManager) {
      const socketStats = socketManager.getStats();
      logger.info(`🔌 Socket.IO stats:`, socketStats);
    }
  }

  // Restart if memory usage is too high (adjust threshold as needed)
  const memoryThreshold = 512; // 512MB threshold
  if (usedMB > memoryThreshold) {
    logger.warn(
      `⚠️ High memory usage detected: ${usedMB}MB > ${memoryThreshold}MB`
    );
    setTimeout(() => {
      restartServer("high_memory_usage");
    }, 5000);
  }
};

// Start memory monitoring
setInterval(monitorMemory, 60000); // Check every minute

// Initial server start
(async () => {
  try {
    logger.info("🚀 Starting Aski server with auto-restart capability...");
    await startServer();
  } catch (error) {
    logger.error("Failed to start server initially:", error);
    setTimeout(() => {
      restartServer("initial_start_failed");
    }, 2000);
  }
})();

export default server;
