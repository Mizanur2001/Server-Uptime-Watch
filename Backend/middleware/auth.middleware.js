const jwt = require("jsonwebtoken");
const { HandleError, UnauthorizedError } = require("../controllers/Base.Controller");

module.exports = function (req, res, next) {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) return UnauthorizedError(res, "Unauthorized access");

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        return HandleError(res, "Invalid or expired token");
    }
};