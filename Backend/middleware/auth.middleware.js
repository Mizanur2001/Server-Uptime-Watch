const jwt = require("jsonwebtoken");
const { HandleError, UnauthorizedError } = require("../controllers/Base.Controller");

module.exports = function (req, res, next) {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return UnauthorizedError(res, "Unauthorized access");
    }

    const token = authHeader.split(" ")[1];

    // Reject if token is not a string or suspiciously long
    if (!token || typeof token !== 'string' || token.length > 2048) {
        return UnauthorizedError(res, "Unauthorized access");
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET, {
            algorithms: ['HS256'],  // Prevent algorithm confusion attacks
            maxAge: '7d',
        });
        req.user = decoded;
        next();
    } catch (err) {
        // Don't leak JWT error details to client
        return UnauthorizedError(res, "Invalid or expired token");
    }
};