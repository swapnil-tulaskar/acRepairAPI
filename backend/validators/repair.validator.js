const { z } = require("zod");

const createRepairSchema = z.object({
  title: z.string().min(1, "Title required").max(100, "Title too long"),
  description: z.string().min(1, "Description required"),
  priority: z.enum(["low", "medium", "high"]).optional()
});

const updateStatusSchema = z.object({
  status: z.enum(["pending", "assigned", "in-progress", "completed", "cancelled"], "Invalid status")
});

module.exports = {
  createRepairSchema,
  updateStatusSchema
};