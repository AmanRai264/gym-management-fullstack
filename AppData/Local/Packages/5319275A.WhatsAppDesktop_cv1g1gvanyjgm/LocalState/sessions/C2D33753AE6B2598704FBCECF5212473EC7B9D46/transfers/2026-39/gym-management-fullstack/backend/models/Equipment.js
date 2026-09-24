const mongoose = require("mongoose");

const equipmentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    category: { type: String },
    brand: { type: String },
    purchaseDate: { type: Date },
    purchasePrice: { type: Number },
    warrantyUntil: { type: Date },
    location: { type: String },
    condition: { type: String, enum: ["Excellent", "Good", "Fair", "Poor"], default: "Good" },
    lastMaintenanceDate: { type: Date },
    nextMaintenanceDate: { type: Date },
    status: {
      type: String,
      enum: ["Working", "Maintenance Required", "Under Repair", "Retired"],
      default: "Working",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Equipment", equipmentSchema);
