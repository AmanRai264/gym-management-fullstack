const Announcement = require("../models/Announcement");

exports.getAnnouncements = async (req, res, next) => {
  try {
    const announcements = await Announcement.find().sort("-date");
    res.json({ success: true, data: announcements });
  } catch (err) { next(err); }
};

exports.createAnnouncement = async (req, res, next) => {
  try {
    const announcement = await Announcement.create(req.body);
    res.status(201).json({ success: true, data: announcement });
  } catch (err) { next(err); }
};

exports.deleteAnnouncement = async (req, res, next) => {
  try {
    const announcement = await Announcement.findByIdAndDelete(req.params.id);
    if (!announcement) return res.status(404).json({ success: false, message: "Announcement not found" });
    res.json({ success: true, message: "Deleted" });
  } catch (err) { next(err); }
};
