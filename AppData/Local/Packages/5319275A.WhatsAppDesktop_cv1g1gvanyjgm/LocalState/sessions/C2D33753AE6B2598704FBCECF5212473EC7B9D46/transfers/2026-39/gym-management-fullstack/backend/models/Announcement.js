const mongoose = require("mongoose");

const announcementSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    targetAudience: {
      type: String,
      enum: ["All Members", "Trainers", "Staff"],
      default: "All Members",
    },
    date: { type: Date, default: Date.now },
    status: { type: String, enum: ["active", "expired"], default: "active" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Announcement", announcementSchema);
