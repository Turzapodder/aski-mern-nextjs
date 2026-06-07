import rateLimit from "express-rate-limit";

const makeLimiter = (windowMs, max, message) =>
  rateLimit({
    windowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    message: { status: "failed", message },
  });

export const authLimiter = makeLimiter(
  15 * 60 * 1000,
  20,
  "Too many attempts from this IP, please try again later."
);

export const quizLimiter = makeLimiter(
  60 * 1000,
  5,
  "Too many quiz requests, please slow down."
);
