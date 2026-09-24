const mongoose = require("mongoose");

const classSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    type: {
      type: String,
      enum: ["Yoga", "Zumba", "CrossFit", "HIIT", "Strength Training", "Cardio", "Personal Training"],
    },
    trainer: { type: mongoose.Schema.Types.ObjectId, ref: "Trainer" },
    capacity: { type: Number, default: 20 },
    date: { type: Date, required: true },
    startTime: { type: String },
    endTime: { type: String },
    status: { type: String, enum: ["scheduled", "cancelled", "completed"], default: "scheduled" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("GymClass", classSchema);
