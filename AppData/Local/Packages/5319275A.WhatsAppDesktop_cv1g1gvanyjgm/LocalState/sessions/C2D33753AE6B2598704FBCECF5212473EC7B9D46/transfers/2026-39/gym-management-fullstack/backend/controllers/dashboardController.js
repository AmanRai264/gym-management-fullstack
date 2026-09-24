const Member = require("../models/Member");
const Attendance = require("../models/Attendance");
const Payment = require("../models/Payment");
const Trainer = require("../models/Trainer");
const Expense = require("../models/Expense");

const startOfDay = (d = new Date()) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
const startOfMonth = (d = new Date()) => new Date(d.getFullYear(), d.getMonth(), 1);
const startOfYear = (d = new Date()) => new Date(d.getFullYear(), 0, 1);

// @desc Dashboard summary stats
// @route GET /api/dashboard/stats?range=today|week|month|year
exports.getStats = async (req, res, next) => {
  try {
    const now = new Date();
    const todayStart = startOfDay(now);
    const monthStart = startOfMonth(now);
    const in30Days = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    const [
      totalMembers,
      activeMembers,
      expiredMembers,
      newMembersThisMonth,
      todaysCheckins,
      activeTrainers,
      pendingPaymentsAgg,
      monthlyRevenueAgg,
      upcomingExpirations,
      recentTransactions,
    ] = await Promise.all([
      Member.countDocuments(),
      Member.countDocuments({ status: "active" }),
      Member.countDocuments({ status: "expired" }),
      Member.countDocuments({ joiningDate: { $gte: monthStart } }),
      Attendance.countDocuments({ date: { $gte: todayStart } }),
      Trainer.countDocuments({ status: "active" }),
      Payment.aggregate([
        { $match: { status: "pending" } },
        { $group: { _id: null, total: { $sum: "$finalAmount" }, count: { $sum: 1 } } },
      ]),
      Payment.aggregate([
        { $match: { status: "paid", date: { $gte: monthStart } } },
        { $group: { _id: null, total: { $sum: "$finalAmount" } } },
      ]),
      Member.find({
        membershipExpiryDate: { $gte: now, $lte: in30Days },
        status: "active",
      })
        .select("fullName memberId membershipExpiryDate")
        .limit(10)
        .sort({ membershipExpiryDate: 1 }),
      Payment.find().sort({ createdAt: -1 }).limit(8).populate("member", "fullName memberId"),
    ]);

    res.json({
      success: true,
      data: {
        totalMembers,
        activeMembers,
        expiredMembers,
        newMembersThisMonth,
        todaysCheckins,
        activeTrainers,
        pendingPayments: pendingPaymentsAgg[0]?.total || 0,
        pendingPaymentsCount: pendingPaymentsAgg[0]?.count || 0,
        monthlyRevenue: monthlyRevenueAgg[0]?.total || 0,
        upcomingExpirations,
        recentTransactions,
      },
    });
  } catch (err) {
    next(err);
  }
};

// @desc Chart data: revenue by month, new members by month, membership distribution, attendance stats
// @route GET /api/dashboard/charts
exports.getCharts = async (req, res, next) => {
  try {
    const now = new Date();
    const twelveMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 11, 1);

    const revenueByMonth = await Payment.aggregate([
      { $match: { status: "paid", date: { $gte: twelveMonthsAgo } } },
      {
        $group: {
          _id: { year: { $year: "$date" }, month: { $month: "$date" } },
          total: { $sum: "$finalAmount" },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);

    const newMembersByMonth = await Member.aggregate([
      { $match: { joiningDate: { $gte: twelveMonthsAgo } } },
      {
        $group: {
          _id: { year: { $year: "$joiningDate" }, month: { $month: "$joiningDate" } },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);

    const membershipDistribution = await Member.aggregate([
      { $match: { status: "active" } },
      { $lookup: { from: "membershipplans", localField: "membershipPlan", foreignField: "_id", as: "plan" } },
      { $unwind: { path: "$plan", preserveNullAndEmptyArrays: true } },
      { $group: { _id: "$plan.name", count: { $sum: 1 } } },
    ]);

    const attendanceLast7Days = await Attendance.aggregate([
      { $match: { date: { $gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) } } },
      { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]);

    const trainerPerformance = await Member.aggregate([
      { $match: { assignedTrainer: { $ne: null } } },
      { $group: { _id: "$assignedTrainer", memberCount: { $sum: 1 } } },
      { $lookup: { from: "trainers", localField: "_id", foreignField: "_id", as: "trainer" } },
      { $unwind: "$trainer" },
      { $project: { trainerName: "$trainer.name", memberCount: 1 } },
      { $sort: { memberCount: -1 } },
      { $limit: 10 },
    ]);

    res.json({
      success: true,
      data: { revenueByMonth, newMembersByMonth, membershipDistribution, attendanceLast7Days, trainerPerformance },
    });
  } catch (err) {
    next(err);
  }
};
