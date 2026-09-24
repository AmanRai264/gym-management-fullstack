const mongoose = require("mongoose");

const membershipPlanSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    durationInMonths: { type: Number, required: true },
    price: { type: Number, required: true },
    description: { type: String },
    features: [{ type: String }],
    accessType: { type: String, enum: ["Basic", "Full", "Premium"], default: "Basic" },
    personalTrainerIncluded: { type: Boolean, default: false },
    status: { type: String, enum: ["active", "inactive"], default: "active" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("MembershipPlan", membershipPlanSchema);
