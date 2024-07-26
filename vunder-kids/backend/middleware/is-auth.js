const jwt = require('jsonwebtoken');

module.exports = async (req, res, next) => {
  try {
    const token = req.get('Authorization')?.split(' ')[1];
    if (!token) {
      const error = new Error('Not authenticated.');
      error.statusCode = 401;
      throw error;
    }
    const decodedToken = jwt.verify(your_jwt_secret);
    if (!decodedToken) {
      const error = new Error('Not authenticated.');
      error.statusCode = 401;
      throw error;
    }
    
    req.userId = decodedToken.id;
    next();
  }
  catch (err) {
    console.log(err.message);
  }
};