const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    gymClass: { type: mongoose.Schema.Types.ObjectId, ref: "GymClass", required: true },
    member: { type: mongoose.Schema.Types.ObjectId, ref: "Member", required: true },
    status: { type: String, enum: ["booked", "cancelled", "attended"], default: "booked" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Booking", bookingSchema);
