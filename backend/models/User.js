const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, select: false },
    role: {
      type: String,
      enum: ["super_admin", "gym_owner", "manager", "trainer", "receptionist", "member"],
      required: true,
      default: "member",
    },
    phone: { type: String },
    photo: { type: String, default: "" },
    isActive: { type: Boolean, default: true },
    // Optional links to role-specific profile documents
    memberProfile: { type: mongoose.Schema.Types.ObjectId, ref: "Member" },
    trainerProfile: { type: mongoose.Schema.Types.ObjectId, ref: "Trainer" },
    lastLogin: { type: Date },
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.comparePassword = function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

module.exports = mongoose.model("User", userSchema);
