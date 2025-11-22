const jwt = require("jsonwebtoken");

exports.verifyToken = (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({message: "No token"});

    try {
        req.user = jwt.verify(token, process.env.JWT_SECRET);
        next();
    } catch (err) {
        return res.status(403).json({message: "Invalid token"});
    }
};

exports.allowRole = (...roles) => {
    return (req,res,next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({message: "Unauthorized role"});
        }
        next();
    };
};