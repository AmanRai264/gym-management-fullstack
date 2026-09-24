const Payment = require("../models/Payment");
const Member = require("../models/Member");
const generateId = require("../utils/idGenerator");

exports.getPayments = async (req, res, next) => {
  try {
    const { search, status, method, page = 1, limit = 20 } = req.query;
    const query = {};
    if (status) query.status = status;
    if (method) query.method = method;

    let memberIds = null;
    if (search) {
      const members = await Member.find({
        $or: [{ fullName: { $regex: search, $options: "i" } }, { memberId: { $regex: search, $options: "i" } }],
      }).select("_id");
      memberIds = members.map((m) => m._id);
      query.member = { $in: memberIds };
    }

    const skip = (Number(page) - 1) * Number(limit);
    const [payments, total] = await Promise.all([
      Payment.find(query)
        .populate("member", "fullName memberId")
        .populate("membershipPlan", "name")
        .sort("-date")
        .skip(skip)
        .limit(Number(limit)),
      Payment.countDocuments(query),
    ]);
    res.json({ success: true, data: payments, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    next(err);
  }
};

exports.createPayment = async (req, res, next) => {
  try {
    const { member, membershipPlan, amount, discount = 0, tax = 0, method, status = "paid", notes } = req.body;
    const finalAmount = Number(amount) - Number(discount) + Number(tax);
    const payment = await Payment.create({
      member,
      membershipPlan,
      amount,
      discount,
      tax,
      finalAmount,
      method,
      status,
      notes,
      invoiceNumber: generateId("INV"),
    });
    res.status(201).json({ success: true, data: payment });
  } catch (err) {
    next(err);
  }
};

exports.updatePaymentStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const payment = await Payment.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!payment) return res.status(404).json({ success: false, message: "Payment not found" });
    res.json({ success: true, data: payment });
  } catch (err) {
    next(err);
  }
};

exports.getInvoice = async (req, res, next) => {
  try {
    const payment = await Payment.findById(req.params.id).populate("member").populate("membershipPlan");
    if (!payment) return res.status(404).json({ success: false, message: "Payment not found" });
    res.json({ success: true, data: payment });
  } catch (err) {
    next(err);
  }
};
