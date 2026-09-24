const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: {
      type: String,
      enum: [
        "membership_expiring",
        "payment_pending",
        "payment_received",
        "new_member",
        "trainer_session",
        "class_reminder",
        "equipment_maintenance",
      ],
    },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Notification", notificationSchema);
