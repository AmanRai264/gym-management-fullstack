const mongoose = require("mongoose");

const gymSettingsSchema = new mongoose.Schema(
  {
    gymName: { type: String, default: "PowerFit Gym" },
    logo: { type: String, default: "" },
    address: { type: String, default: "" },
    phone: { type: String, default: "" },
    email: { type: String, default: "" },
    workingHours: { type: String, default: "Mon-Sun, 6:00 AM - 10:00 PM" },
    currency: { type: String, default: "INR" },
    taxPercent: { type: Number, default: 18 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("GymSettings", gymSettingsSchema);
