const { validationResult } = require("express-validator");

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) return next();

  res.status(400);
  next(new Error(errors.array().map((error) => error.msg).join(", ")));
};

module.exports = validate;
