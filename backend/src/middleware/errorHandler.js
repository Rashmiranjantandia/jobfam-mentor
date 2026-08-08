/**
 * Central error handler — must be the LAST middleware registered in server.js.
 * Controllers call next(err) to reach here; this ensures consistent error shape
 * across the whole API.
 */
const errorHandler = (err, req, res, next) => {
  console.error(err.stack || err.message);

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal server error';

  res.status(statusCode).json({ message });
};

module.exports = errorHandler;
