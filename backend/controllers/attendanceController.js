const Attendance = require("../models/Attendance");
const Member = require("../models/Member");

const startOfDay = (d = new Date()) => new Date(d.getFullYear(), d.getMonth(), d.getDate());

exports.checkIn = async (req, res, next) => {
  try {
    const { memberId, method = "Manual" } = req.body;
    const member = await Member.findById(memberId);
    if (!member) return res.status(404).json({ success: false, message: "Member not found" });

    const today = startOfDay();
    const existing = await Attendance.findOne({ member: memberId, date: { $gte: today }, checkOutTime: null });
    if (existing) {
      return res.status(400).json({ success: false, message: "Member already checked in today" });
    }
    const record = await Attendance.create({ member: memberId, date: new Date(), checkInTime: new Date(), method });
    res.status(201).json({ success: true, data: record });
  } catch (err) {
    next(err);
  }
};

exports.checkOut = async (req, res, next) => {
  try {
    const record = await Attendance.findById(req.params.id);
    if (!record) return res.status(404).json({ success: false, message: "Attendance record not found" });
    record.checkOutTime = new Date();
    await record.save();
    res.json({ success: true, data: record });
  } catch (err) {
    next(err);
  }
};

exports.getToday = async (req, res, next) => {
  try {
    const today = startOfDay();
    const records = await Attendance.find({ date: { $gte: today } })
      .populate("member", "fullName memberId photo")
      .sort("-checkInTime");
    res.json({ success: true, data: records });
  } catch (err) {
    next(err);
  }
};

exports.getHistory = async (req, res, next) => {
  try {
    const { member, from, to, page = 1, limit = 30 } = req.query;
    const query = {};
    if (member) query.member = member;
    if (from || to) {
      query.date = {};
      if (from) query.date.$gte = new Date(from);
      if (to) query.date.$lte = new Date(to);
    }
    const skip = (Number(page) - 1) * Number(limit);
    const [records, total] = await Promise.all([
      Attendance.find(query).populate("member", "fullName memberId").sort("-date").skip(skip).limit(Number(limit)),
      Attendance.countDocuments(query),
    ]);
    res.json({ success: true, data: records, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    next(err);
  }
};

exports.getStats = async (req, res, next) => {
  try {
    const today = startOfDay();
    const [presentToday, totalMembers] = await Promise.all([
      Attendance.distinct("member", { date: { $gte: today } }),
      Member.countDocuments({ status: "active" }),
    ]);
    const hourlyAgg = await Attendance.aggregate([
      { $match: { date: { $gte: today } } },
      { $group: { _id: { $hour: "$checkInTime" }, count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 1 },
    ]);
    res.json({
      success: true,
      data: {
        presentToday: presentToday.length,
        absentToday: Math.max(totalMembers - presentToday.length, 0),
        totalCheckins: presentToday.length,
        peakHour: hourlyAgg[0] ? `${hourlyAgg[0]._id}:00` : "N/A",
      },
    });
  } catch (err) {
    next(err);
  }
};
