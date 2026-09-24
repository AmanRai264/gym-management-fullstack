const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    member: { type: mongoose.Schema.Types.ObjectId, ref: "Member", required: true },
    membershipPlan: { type: mongoose.Schema.Types.ObjectId, ref: "MembershipPlan" },
    amount: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    tax: { type: Number, default: 0 },
    finalAmount: { type: Number, required: true },
    method: {
      type: String,
      enum: ["Cash", "UPI", "Credit Card", "Debit Card", "Bank Transfer"],
      default: "Cash",
    },
    status: { type: String, enum: ["paid", "pending", "refunded"], default: "paid" },
    invoiceNumber: { type: String, unique: true },
    date: { type: Date, default: Date.now },
    notes: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Payment", paymentSchema);
