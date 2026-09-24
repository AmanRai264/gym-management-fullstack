const mongoose = require("mongoose");

const dietPlanSchema = new mongoose.Schema(
  {
    planName: { type: String, required: true },
    member: { type: mongoose.Schema.Types.ObjectId, ref: "Member" },
    calories: { type: Number },
    protein: { type: Number },
    carbs: { type: Number },
    fat: { type: Number },
    meals: [
      {
        type: { type: String, enum: ["Breakfast", "Mid-Morning", "Lunch", "Evening", "Dinner"] },
        time: { type: String },
        items: [{ type: String }],
      },
    ],
    status: { type: String, enum: ["active", "completed"], default: "active" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("DietPlan", dietPlanSchema);
