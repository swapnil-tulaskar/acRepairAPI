const { logger } = require("../utils/logger.js");

const adminOnly = (req, res, next) => {
  console.log("👑 adminOnly middleware called");
  logger.debug(`ADMIN CHECK USER: ${JSON.stringify(req.user)}`);

  if (!req.user) {
    logger.error("ADMIN BLOCKED: No user in request");
    return res.status(401).json({
      success: false,
      message: "Unauthorized: Login required"
    });
  }

  if (req.user.role !== "admin") {
    logger.error(`ADMIN BLOCKED: role=${req.user.role}`);
    return res.status(403).json({
      success: false,
      message: "Access denied: Admin only. This area is only for administrators."
    });
  }

  logger.debug("ADMIN ACCESS GRANTED");
  console.log("✅ adminOnly middleware complete, calling next()");
  next();
};

module.exports = { adminOnly };