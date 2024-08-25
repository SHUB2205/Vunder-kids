const jwt = require('jsonwebtoken');

module.exports = (socket, next) => {
  const token = socket.handshake.query?.token;
  if (token) {
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        return next(new Error("Authentication error"));
      }
      socket.user = decoded; // Attach user data to the socket
      next();
    });
  } else {
    next(new Error("Authentication error"));
  }
};
