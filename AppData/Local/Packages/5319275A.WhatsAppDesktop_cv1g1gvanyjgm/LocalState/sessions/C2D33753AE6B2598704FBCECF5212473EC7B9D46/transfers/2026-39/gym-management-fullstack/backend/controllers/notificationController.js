const Notification = require("../models/Notification");

exports.getNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification.find().sort("-createdAt").limit(50);
    const unreadCount = await Notification.countDocuments({ isRead: false });
    res.json({ success: true, data: notifications, unreadCount });
  } catch (err) { next(err); }
};

exports.markRead = async (req, res, next) => {
  try {
    const notif = await Notification.findByIdAndUpdate(req.params.id, { isRead: true }, { new: true });
    if (!notif) return res.status(404).json({ success: false, message: "Notification not found" });
    res.json({ success: true, data: notif });
  } catch (err) { next(err); }
};

exports.markAllRead = async (req, res, next) => {
  try {
    await Notification.updateMany({ isRead: false }, { isRead: true });
    res.json({ success: true, message: "All notifications marked read" });
  } catch (err) { next(err); }
};
