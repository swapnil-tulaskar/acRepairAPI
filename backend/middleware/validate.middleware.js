const { ZodError } = require("zod");

const validate = (schema) => {
  console.log("📝 validate middleware factory called");
  
  return (req, res, next) => {
    console.log("✅ validate middleware executing for:", req.path);
    console.log("Request body:", req.body);
    
    try {
      const result = schema.parse(req.body);
      req.body = result;
      console.log("✅ Validation passed");
      next();
    } catch (err) {
      console.log("❌ Validation failed:", err);
      
      // Handle Zod errors directly - don't pass to global error handler
      if (err instanceof ZodError) {
        const errors = err.errors.map((e) => ({
          field: e.path.join("."),
          message: e.message,
          code: e.code
        }));

        return res.status(422).json({
          success: false,
          message: "Validation error",
          errors: errors
        });
      }
      
      // Handle other errors
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: [{ message: err.message }]
      });
    }
  };
};

module.exports = { validate };