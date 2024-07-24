const rateLimit = require('express-rate-limit');

const emailVerificationLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 min window
    max: 1, // limit each IP to 1 requests per windowMs
    message: 'Too many verification email requests from this IP, please try again after an hour',
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

module.exports = {emailVerificationLimiter}