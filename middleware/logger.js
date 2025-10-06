// Simple logger middleware - only logs which API was hit
const logger = (req, res, next) => {
  const timestamp = new Date().toISOString();
  const method = req.method;
  const url = req.originalUrl;

  // Simple one-line log
  console.log(`[${timestamp}] ${method} ${url}`);

  next();
};

module.exports = { logger };
