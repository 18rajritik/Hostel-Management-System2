const jwt = require("jsonwebtoken");
const User = require("../models/User");

const protect = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  // Browser requests send the token as: Authorization: Bearer <token>
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401);
    return next(new Error("Not authorized. Token missing."));
  }

  try {
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select("-password");

    if (!req.user) {
      res.status(401);
      return next(new Error("User no longer exists."));
    }

    next();
  } catch (error) {
    res.status(401);
    next(new Error("Not authorized. Token invalid."));
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    // A valid user may still be blocked if their role does not match the route.
    if (!roles.includes(req.user.role)) {
      res.status(403);
      return next(new Error("You do not have permission for this action."));
    }
    next();
  };
};

module.exports = { protect, authorize };
