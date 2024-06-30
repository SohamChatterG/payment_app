

const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('./config');

const authMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(403).json({ msg: "No authorization in headers" });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, JWT_SECRET);

        req.userId = decoded.userId; // Extract userId from the decoded payload
        // console.log(decoded)
        next();
    } catch (err) {
        return res.status(403).json({ msg: "Invalid or expired token" });
    }
};

module.exports = {
    authMiddleware
};
