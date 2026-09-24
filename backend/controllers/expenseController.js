const Expense = require("../models/Expense");
const Payment = require("../models/Payment");

exports.getExpenses = async (req, res, next) => {
  try {
    const { category, from, to } = req.query;
    const query = {};
    if (category) query.category = category;
    if (from || to) {
      query.date = {};
      if (from) query.date.$gte = new Date(from);
      if (to) query.date.$lte = new Date(to);
    }
    const expenses = await Expense.find(query).sort("-date");
    const total = expenses.reduce((sum, e) => sum + e.amount, 0);
    res.json({ success: true, data: expenses, total });
  } catch (err) { next(err); }
};

exports.createExpense = async (req, res, next) => {
  try {
    const expense = await Expense.create(req.body);
    res.status(201).json({ success: true, data: expense });
  } catch (err) { next(err); }
};

exports.deleteExpense = async (req, res, next) => {
  try {
    const expense = await Expense.findByIdAndDelete(req.params.id);
    if (!expense) return res.status(404).json({ success: false, message: "Expense not found" });
    res.json({ success: true, message: "Deleted" });
  } catch (err) { next(err); }
};

exports.getProfitSummary = async (req, res, next) => {
  try {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const [revenueAgg, expensesAgg] = await Promise.all([
      Payment.aggregate([{ $match: { status: "paid", date: { $gte: monthStart } } }, { $group: { _id: null, total: { $sum: "$finalAmount" } } }]),
      Expense.aggregate([{ $match: { date: { $gte: monthStart } } }, { $group: { _id: null, total: { $sum: "$amount" } } }]),
    ]);
    const revenue = revenueAgg[0]?.total || 0;
    const expenses = expensesAgg[0]?.total || 0;
    res.json({ success: true, data: { revenue, expenses, profit: revenue - expenses } });
  } catch (err) { next(err); }
};
