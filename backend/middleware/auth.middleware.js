const jwt = require("jsonwebtoken");
const { logger } = require("../utils/logger.js");

const protect = (req, res, next) => {
  console.log("🔐 protect middleware called");
  
  const authHeader = req.headers.authorization || req.headers.Authorization;

  logger.debug(`AUTH HEADER: ${authHeader}`);

  if (!authHeader) {
    logger.error("TOKEN MISSING");
    return res.status(401).json({
      success: false,
      message: "Authorization token missing"
    });
  }

  if (!authHeader.startsWith("Bearer ")) {
    logger.error("INVALID TOKEN FORMAT");
    return res.status(401).json({
      success: false,
      message: "Invalid token format. Use Bearer <token>"
    });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    logger.debug(`DECODED USER: ${decoded.id} with role: ${decoded.role}, email: ${decoded.email}`);
    
    // ✅ Make sure email is included in req.user
    req.user = {
      id: decoded.id,
      role: decoded.role,
      email: decoded.email || null
    };
    
    console.log("✅ protect middleware complete, calling next()");
    next();
  } catch (err) {
    logger.error("TOKEN VERIFICATION FAILED");
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token"
    });
  }
};

module.exports = { protect };