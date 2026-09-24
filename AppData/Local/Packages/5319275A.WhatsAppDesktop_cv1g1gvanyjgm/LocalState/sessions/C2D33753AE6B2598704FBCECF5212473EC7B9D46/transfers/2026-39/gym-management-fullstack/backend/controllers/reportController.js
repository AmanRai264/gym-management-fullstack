const Member = require("../models/Member");
const Attendance = require("../models/Attendance");
const Payment = require("../models/Payment");
const Expense = require("../models/Expense");

// @route GET /api/reports/revenue?from=&to=
exports.revenueReport = async (req, res, next) => {
  try {
    const { from, to } = req.query;
    const query = { status: "paid" };
    if (from || to) {
      query.date = {};
      if (from) query.date.$gte = new Date(from);
      if (to) query.date.$lte = new Date(to);
    }
    const payments = await Payment.find(query).populate("member", "fullName memberId").sort("-date");
    const total = payments.reduce((s, p) => s + p.finalAmount, 0);
    res.json({ success: true, data: payments, total });
  } catch (err) { next(err); }
};

// @route GET /api/reports/membership
exports.membershipReport = async (req, res, next) => {
  try {
    const byStatus = await Member.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]);
    const byPlan = await Member.aggregate([
      { $lookup: { from: "membershipplans", localField: "membershipPlan", foreignField: "_id", as: "plan" } },
      { $unwind: { path: "$plan", preserveNullAndEmptyArrays: true } },
      { $group: { _id: "$plan.name", count: { $sum: 1 } } },
    ]);
    res.json({ success: true, data: { byStatus, byPlan } });
  } catch (err) { next(err); }
};

// @route GET /api/reports/attendance
exports.attendanceReport = async (req, res, next) => {
  try {
    const { from, to } = req.query;
    const query = {};
    if (from || to) {
      query.date = {};
      if (from) query.date.$gte = new Date(from);
      if (to) query.date.$lte = new Date(to);
    }
    const records = await Attendance.find(query).populate("member", "fullName memberId").sort("-date");
    res.json({ success: true, data: records, total: records.length });
  } catch (err) { next(err); }
};

// @route GET /api/reports/expense
exports.expenseReport = async (req, res, next) => {
  try {
    const byCategory = await Expense.aggregate([{ $group: { _id: "$category", total: { $sum: "$amount" } } }]);
    res.json({ success: true, data: byCategory });
  } catch (err) { next(err); }
};
