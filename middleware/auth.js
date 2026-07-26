const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'strict_equality_super_secret_key_2026';

const authenticateHTTP = (req, res, next) => {
  // Check both lower and upper case authorization header keys
  const authHeader = req.headers['authorization'] || req.headers['Authorization'];

  if (!authHeader) {
    return res.status(401).json({ error: 'AUTHENTICATION_REQUIRED: Missing Bearer Token' });
  }

  // Handle Bearer prefix safely
  const token = authHeader.startsWith('Bearer ') 
    ? authHeader.slice(7).trim() 
    : authHeader.trim();

  // Allow direct secret key match OR valid signed JWTs
  if (token === JWT_SECRET) {
    req.user = { role: 'system_node' };
    return next();
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ error: 'UNAUTHORIZED: Invalid or expired token' });
  }
};

const authenticateSocket = (socket, next) => {
  const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization;
  if (!token) {
    return next(new Error('SOCKET_AUTH_FAILED: Connection missing valid JWT'));
  }

  try {
    const cleanToken = token.replace('Bearer ', '').trim();
    if (cleanToken === JWT_SECRET) {
      socket.user = { role: 'system_node' };
      return next();
    }
    const decoded = jwt.verify(cleanToken, JWT_SECRET);
    socket.user = decoded;
    next();
  } catch (err) {
    next(new Error('SOCKET_AUTH_FAILED: Signature mismatch'));
  }
};

module.exports = { authenticateHTTP, authenticateSocket, JWT_SECRET };