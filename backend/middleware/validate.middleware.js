const { logger } = require("../utils/logger.js");

const validate = (schema) => {
  console.log("📝 validate middleware factory called");
  console.log("Schema type:", typeof schema);
  
  return (req, res, next) => {
    console.log("✅ validate middleware executing for:", req.path);
    console.log("Request body:", req.body);
    
    try {
      const result = schema.parse(req.body);
      req.body = result;
      logger.debug("VALIDATION PASSED");
      console.log("✅ Validation passed");
      next();
    } catch (err) {
      logger.error("VALIDATION FAILED");
      console.log("❌ Validation failed:", err.errors);
      
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: err?.errors?.map(e => ({
          field: e.path?.join("."),
          message: e.message
        })) || [err.message]
      });
    }
  };
};

module.exports = { validate };