const Member = require("../models/Member");
const MembershipPlan = require("../models/MembershipPlan");
const generateId = require("../utils/idGenerator");

const addMonths = (date, months) => {
  const d = new Date(date);
  d.setMonth(d.getMonth() + months);
  return d;
};

// @route GET /api/members
exports.getMembers = async (req, res, next) => {
  try {
    const { search, status, plan, sort = "-createdAt", page = 1, limit = 20 } = req.query;
    const query = {};
    if (search) {
      query.$or = [
        { fullName: { $regex: search, $options: "i" } },
        { memberId: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }
    if (status) query.status = status;
    if (plan) query.membershipPlan = plan;

    const skip = (Number(page) - 1) * Number(limit);
    const [members, total] = await Promise.all([
      Member.find(query)
        .populate("membershipPlan", "name price durationInMonths")
        .populate("assignedTrainer", "name")
        .sort(sort)
        .skip(skip)
        .limit(Number(limit)),
      Member.countDocuments(query),
    ]);

    res.json({ success: true, data: members, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    next(err);
  }
};

// @route GET /api/members/:id
exports.getMember = async (req, res, next) => {
  try {
    const member = await Member.findById(req.params.id)
      .populate("membershipPlan")
      .populate("assignedTrainer", "name email phone");
    if (!member) return res.status(404).json({ success: false, message: "Member not found" });
    res.json({ success: true, data: member });
  } catch (err) {
    next(err);
  }
};

// @route POST /api/members
exports.createMember = async (req, res, next) => {
  try {
    const payload = { ...req.body };
    payload.memberId = generateId("MEM");

    if (payload.membershipPlan) {
      const plan = await MembershipPlan.findById(payload.membershipPlan);
      if (plan) {
        payload.membershipStartDate = payload.membershipStartDate || new Date();
        payload.membershipExpiryDate = addMonths(payload.membershipStartDate, plan.durationInMonths);
      }
    }

    const member = await Member.create(payload);
    res.status(201).json({ success: true, data: member });
  } catch (err) {
    next(err);
  }
};

// @route PUT /api/members/:id
exports.updateMember = async (req, res, next) => {
  try {
    const payload = { ...req.body };
    if (payload.membershipPlan && payload.membershipStartDate) {
      const plan = await MembershipPlan.findById(payload.membershipPlan);
      if (plan) {
        payload.membershipExpiryDate = addMonths(payload.membershipStartDate, plan.durationInMonths);
      }
    }
    const member = await Member.findByIdAndUpdate(req.params.id, payload, { new: true, runValidators: true });
    if (!member) return res.status(404).json({ success: false, message: "Member not found" });
    res.json({ success: true, data: member });
  } catch (err) {
    next(err);
  }
};

// @route DELETE /api/members/:id
exports.deleteMember = async (req, res, next) => {
  try {
    const member = await Member.findByIdAndDelete(req.params.id);
    if (!member) return res.status(404).json({ success: false, message: "Member not found" });
    res.json({ success: true, message: "Member deleted" });
  } catch (err) {
    next(err);
  }
};

// @route POST /api/members/:id/renew
exports.renewMembership = async (req, res, next) => {
  try {
    const member = await Member.findById(req.params.id).populate("membershipPlan");
    if (!member) return res.status(404).json({ success: false, message: "Member not found" });
    const base = member.membershipExpiryDate && member.membershipExpiryDate > new Date() ? member.membershipExpiryDate : new Date();
    member.membershipStartDate = member.membershipStartDate || new Date();
    member.membershipExpiryDate = addMonths(base, member.membershipPlan?.durationInMonths || 1);
    member.status = "active";
    await member.save();
    res.json({ success: true, data: member });
  } catch (err) {
    next(err);
  }
};

// @route POST /api/members/:id/freeze
exports.freezeMembership = async (req, res, next) => {
  try {
    const member = await Member.findByIdAndUpdate(req.params.id, { status: "frozen" }, { new: true });
    if (!member) return res.status(404).json({ success: false, message: "Member not found" });
    res.json({ success: true, data: member });
  } catch (err) {
    next(err);
  }
};

// @route POST /api/members/:id/cancel
exports.cancelMembership = async (req, res, next) => {
  try {
    const member = await Member.findByIdAndUpdate(req.params.id, { status: "cancelled" }, { new: true });
    if (!member) return res.status(404).json({ success: false, message: "Member not found" });
    res.json({ success: true, data: member });
  } catch (err) {
    next(err);
  }
};
