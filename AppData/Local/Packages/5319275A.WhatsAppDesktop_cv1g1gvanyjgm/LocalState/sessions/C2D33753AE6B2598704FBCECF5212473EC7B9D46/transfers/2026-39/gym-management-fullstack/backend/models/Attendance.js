const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema(
  {
    member: { type: mongoose.Schema.Types.ObjectId, ref: "Member", required: true },
    date: { type: Date, required: true, default: Date.now },
    checkInTime: { type: Date, required: true },
    checkOutTime: { type: Date },
    method: { type: String, enum: ["QR", "RFID", "Manual"], default: "Manual" },
  },
  { timestamps: true }
);

attendanceSchema.index({ member: 1, date: 1 });

module.exports = mongoose.model("Attendance", attendanceSchema);
