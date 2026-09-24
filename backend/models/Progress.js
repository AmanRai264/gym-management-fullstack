const mongoose = require("mongoose");

const progressSchema = new mongoose.Schema(
  {
    member: { type: mongoose.Schema.Types.ObjectId, ref: "Member", required: true },
    date: { type: Date, default: Date.now },
    weight: { type: Number },
    height: { type: Number },
    bmi: { type: Number },
    bodyFatPercent: { type: Number },
    chest: { type: Number },
    waist: { type: Number },
    arms: { type: Number },
    thighs: { type: Number },
    muscleMass: { type: Number },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Progress", progressSchema);
