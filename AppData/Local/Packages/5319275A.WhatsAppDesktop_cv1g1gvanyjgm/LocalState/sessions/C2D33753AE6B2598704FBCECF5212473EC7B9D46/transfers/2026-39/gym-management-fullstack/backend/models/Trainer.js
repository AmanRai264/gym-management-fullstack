const mongoose = require("mongoose");

const trainerSchema = new mongoose.Schema(
  {
    trainerId: { type: String, unique: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    name: { type: String, required: true },
    photo: { type: String, default: "" },
    phone: { type: String },
    email: { type: String },
    specialization: [{ type: String }],
    experience: { type: Number, default: 0 }, // years
    salary: { type: Number, default: 0 },
    joiningDate: { type: Date, default: Date.now },
    availability: { type: String, default: "Mon-Sat, 6AM-9PM" },
    status: { type: String, enum: ["active", "on_leave", "inactive"], default: "active" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Trainer", trainerSchema);
