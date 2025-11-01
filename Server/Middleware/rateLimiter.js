import rateLimit from "express-rate-limit";

// =============================================
// RATE LIMIT CONFIGURATION
// =============================================

// 👇 GENERAL API LIMIT - For all routes
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes window
  max: 100, // Max 100 requests per IP per 15 minutes
  message: {
    error: "Too many requests",
    message: "Please try again after 15 minutes",
  },
  standardHeaders: true, // Return rate limit info in headers
  legacyHeaders: false, // Disable X-RateLimit headers
});

// 👇 CODE EXECUTION LIMIT - Strict limits for Judge0 calls
const codeExecutionLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute window
  max: 10, // Max 10 code executions per IP per minute
  message: {
    error: "Code execution limit exceeded",
    message: "Too many code executions, please wait 1 minute",
  },
  standardHeaders: true,
  legacyHeaders: false,
  // 👇 Custom key generator - rate limit by user ID if authenticated
  keyGenerator: (req) => {
    return req.user ? req.user._id.toString() : req.ip;
  },
  // 👇 Skip counting for certain conditions (optional)
  skip: (req) => {
    // Don't count admin users (if you have admin role)
    return req.user && req.user.role === "admin";
  },
});

// 👇 AUTHENTICATION LIMIT - Prevent brute force attacks
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Max 5 login attempts per IP per 15 minutes
  message: {
    error: "Too many authentication attempts",
    message: "Please try again after 15 minutes",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// 👇 SUBMISSION LIMIT - Aligns with queue capacity
const submissionLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute window
  max: 15, // Max 15 submissions per user per minute
  message: {
    error: "Submission limit exceeded",
    message: "Please wait a minute before submitting more code",
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    return req.user ? req.user._id.toString() : req.ip;
  },
  // 👇 This matches our queue capacity (5 workers × 3 jobs per minute)
  handler: (req, res) => {
    res.status(429).json({
      error: "Submission limit exceeded",
      message:
        "Our system is processing your previous submissions. Please wait a moment.",
      retryAfter: Math.ceil(req.rateLimit.resetTime / 1000), // Seconds until reset
      limit: req.rateLimit.limit,
      remaining: req.rateLimit.remaining,
      resetTime: new Date(req.rateLimit.resetTime).toISOString(),
    });
  },
});

export { generalLimiter, codeExecutionLimiter, authLimiter, submissionLimiter };
