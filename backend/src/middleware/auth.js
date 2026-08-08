const jwt = require('jsonwebtoken');

/**
 * verifyToken — attaches the decoded JWT payload (id, role) to req.user.
 * Returns 401 if no token is present, 403 if the token is invalid/expired.
 */
const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token — access denied' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { id, role, iat, exp }
    next();
  } catch {
    return res.status(403).json({ message: 'Invalid or expired token' });
  }
};

/**
 * requireRole — factory that returns a middleware enforcing a specific role.
 * Must be used after verifyToken (depends on req.user being set).
 */
const requireRole = (role) => (req, res, next) => {
  if (req.user?.role !== role) {
    return res.status(403).json({ message: `Access restricted to ${role}s` });
  }
  next();
};

module.exports = { verifyToken, requireRole };
