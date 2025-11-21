// import rateLimit from "express-rate-limit";

// // =============================================
// // RATE LIMIT CONFIGURATION
// // =============================================

// // 👇 GENERAL API LIMIT - For all routes
// const generalLimiter = rateLimit({
//   windowMs: 15 * 60 * 1000, // 15 minutes window
//   max: 100, // Max 100 requests per IP per 15 minutes
//   message: {
//     error: "Too many requests",
//     message: "Please try again after 15 minutes",
//   },
//   standardHeaders: true, // Return rate limit info in headers
//   legacyHeaders: false, // Disable X-RateLimit headers
// });

// // 👇 CODE EXECUTION LIMIT - Strict limits for Judge0 calls
// const codeExecutionLimiter = rateLimit({
//   windowMs: 1 * 60 * 1000, // 1 minute window
//   max: 10, // Max 10 code executions per IP per minute
//   message: {
//     error: "Code execution limit exceeded",
//     message: "Too many code executions, please wait 1 minute",
//   },
//   standardHeaders: true,
//   legacyHeaders: false,
//   // 👇 Custom key generator - rate limit by user ID if authenticated
//   keyGenerator: (req) => {
//     return req.user ? req.user._id.toString() : req.ip;
//   },
//   // 👇 Skip counting for certain conditions (optional)
//   skip: (req) => {
//     // Don't count admin users (if you have admin role)
//     return req.user && req.user.role === "admin";
//   },
// });

// // 👇 AUTHENTICATION LIMIT - Prevent brute force attacks
// const authLimiter = rateLimit({
//   windowMs: 15 * 60 * 1000, // 15 minutes
//   max: 5, // Max 5 login attempts per IP per 15 minutes
//   message: {
//     error: "Too many authentication attempts",
//     message: "Please try again after 15 minutes",
//   },
//   standardHeaders: true,
//   legacyHeaders: false,
// });

// // 👇 SUBMISSION LIMIT - Aligns with queue capacity
// const submissionLimiter = rateLimit({
//   windowMs: 1 * 60 * 1000, // 1 minute window
//   max: 15, // Max 15 submissions per user per minute
//   message: {
//     error: "Submission limit exceeded",
//     message: "Please wait a minute before submitting more code",
//   },
//   standardHeaders: true,
//   legacyHeaders: false,
//   keyGenerator: (req) => {
//     return req.user ? req.user._id.toString() : req.ip;
//   },
//   // 👇 This matches our queue capacity (5 workers × 3 jobs per minute)
//   handler: (req, res) => {
//     res.status(429).json({
//       error: "Submission limit exceeded",
//       message:
//         "Our system is processing your previous submissions. Please wait a moment.",
//       retryAfter: Math.ceil(req.rateLimit.resetTime / 1000), // Seconds until reset
//       limit: req.rateLimit.limit,
//       remaining: req.rateLimit.remaining,
//       resetTime: new Date(req.rateLimit.resetTime).toISOString(),
//     });
//   },
// });

// export { generalLimiter, codeExecutionLimiter, authLimiter, submissionLimiter };

// Server/Middleware/rateLimiter.js
import rateLimit, { ipKeyGenerator } from "express-rate-limit";

// =============================================
// RATE LIMIT CONFIGURATION
// =============================================

// Helper to safely compute retryAfter seconds
const getRetryAfterSeconds = (req) => {
  const resetTime = req?.rateLimit?.resetTime;
  if (!resetTime) return undefined;
  const seconds = Math.ceil((resetTime - Date.now()) / 1000);
  return seconds > 0 ? seconds : 0;
};

// 👇 GENERAL API LIMIT - For all routes
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes window
  max: 100, // Max 100 requests per user/key/IP per 15 minutes
  message: {
    error: "Too many requests",
    message: "Please try again after 15 minutes",
  },
  standardHeaders: true, // Return rate limit info in headers
  legacyHeaders: false, // Disable X-RateLimit headers
  // Prefer any auth identity if present, otherwise use IPv6-safe ipKeyGenerator
  keyGenerator: (req) => {
    if (req.user && req.user._id) return req.user._id.toString();
    // Use ipKeyGenerator to avoid IPv6 bypass
    return ipKeyGenerator(req.ip);
  },
});

// 👇 CODE EXECUTION LIMIT - Strict limits for Judge0 calls
const codeExecutionLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute window
  max: 10, // Max 10 code executions per user/IP per minute
  message: {
    error: "Code execution limit exceeded",
    message: "Too many code executions, please wait 1 minute",
  },
  standardHeaders: true,
  legacyHeaders: false,
  // 👇 Custom key generator - rate limit by user ID if authenticated, else IPv6-safe IP
  keyGenerator: (req) => {
    if (req.user && req.user._id) return req.user._id.toString();
    return ipKeyGenerator(req.ip);
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
  max: 5, // Max 5 login attempts per user/IP per 15 minutes
  message: {
    error: "Too many authentication attempts",
    message: "Please try again after 15 minutes",
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    // If you have username/email in body you might want to key by that (optional).
    // Fallback to IPv6-safe IP:
    return ipKeyGenerator(req.ip);
  },
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
    // Rate limit per authenticated user if available, else IPv6-safe IP
    if (req.user && req.user._id) return req.user._id.toString();
    return ipKeyGenerator(req.ip);
  },
  // 👇 This matches our queue capacity (5 workers × 3 jobs per minute)
  handler: (req, res) => {
    const retryAfter = getRetryAfterSeconds(req);
    res.setHeader("Retry-After", retryAfter ?? 60); // best-effort header
    res.status(429).json({
      error: "Submission limit exceeded",
      message:
        "Our system is processing your previous submissions. Please wait a moment.",
      retryAfterSeconds: retryAfter,
      limit: req?.rateLimit?.limit,
      remaining: req?.rateLimit?.remaining,
      resetTime: req?.rateLimit?.resetTime
        ? new Date(req.rateLimit.resetTime).toISOString()
        : undefined,
    });
  },
});

export { generalLimiter, codeExecutionLimiter, authLimiter, submissionLimiter };
