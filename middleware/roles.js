const deny = (res, message) => {
  res.status(403).json({ success: false, message });
};

const isAdmin = (req, res, next) => {
  if (req.user?.role === "admin") return next();
  return deny(res, "Admin access required.");
};

const isWarden = (req, res, next) => {
  if (["admin", "warden"].includes(req.user?.role)) return next();
  return deny(res, "Admin or warden access required.");
};

const isStudent = (req, res, next) => {
  if (req.user?.role === "student") return next();
  return deny(res, "Student access required.");
};

module.exports = { isAdmin, isWarden, isStudent };
