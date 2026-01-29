const jwt = require('jsonwebtoken');

const socketAuth = (socket, next) => {
  try {
    const token = socket.handshake.auth.token;
    
    if (!token) {
      return next(new Error('Authentication error'));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret');
    socket.user = { id: decoded.id };
    next();
  } catch (error) {
    next(new Error('Authentication error'));
  }
};

module.exports = socketAuth;
