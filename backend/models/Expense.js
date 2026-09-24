const mongoose = require("mongoose");

const expenseSchema = new mongoose.Schema(
  {
    category: {
      type: String,
      enum: ["Rent", "Electricity", "Equipment", "Staff Salary", "Maintenance", "Marketing", "Software", "Other"],
      required: true,
    },
    description: { type: String },
    amount: { type: Number, required: true },
    date: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Expense", expenseSchema);
