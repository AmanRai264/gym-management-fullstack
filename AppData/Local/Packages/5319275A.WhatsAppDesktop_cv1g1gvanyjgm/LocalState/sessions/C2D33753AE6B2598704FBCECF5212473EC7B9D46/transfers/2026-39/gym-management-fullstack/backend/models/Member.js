const mongoose = require("mongoose");

const memberSchema = new mongoose.Schema(
  {
    memberId: { type: String, unique: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    fullName: { type: String, required: true },
    photo: { type: String, default: "" },
    dob: { type: Date },
    gender: { type: String, enum: ["Male", "Female", "Other"] },
    phone: { type: String },
    email: { type: String },
    address: { type: String },
    emergencyContact: { type: String },
    joiningDate: { type: Date, default: Date.now },
    membershipPlan: { type: mongoose.Schema.Types.ObjectId, ref: "MembershipPlan" },
    membershipStartDate: { type: Date },
    membershipExpiryDate: { type: Date },
    assignedTrainer: { type: mongoose.Schema.Types.ObjectId, ref: "Trainer" },
    bloodGroup: { type: String },
    height: { type: Number }, // cm
    weight: { type: Number }, // kg
    bmi: { type: Number },
    medicalNotes: { type: String },
    status: {
      type: String,
      enum: ["active", "expired", "frozen", "cancelled"],
      default: "active",
    },
  },
  { timestamps: true }
);

memberSchema.pre("save", function (next) {
  if (this.height && this.weight) {
    const hM = this.height / 100;
    this.bmi = +(this.weight / (hM * hM)).toFixed(1);
  }
  next();
});

module.exports = mongoose.model("Member", memberSchema);
