const DietPlan = require("../models/DietPlan");

exports.getDietPlans = async (req, res, next) => {
  try {
    const { member } = req.query;
    const query = {};
    if (member) query.member = member;
    const plans = await DietPlan.find(query).populate("member", "fullName memberId").sort("-createdAt");
    res.json({ success: true, data: plans });
  } catch (err) { next(err); }
};

exports.createDietPlan = async (req, res, next) => {
  try {
    const plan = await DietPlan.create(req.body);
    res.status(201).json({ success: true, data: plan });
  } catch (err) { next(err); }
};

exports.updateDietPlan = async (req, res, next) => {
  try {
    const plan = await DietPlan.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!plan) return res.status(404).json({ success: false, message: "Diet plan not found" });
    res.json({ success: true, data: plan });
  } catch (err) { next(err); }
};

exports.deleteDietPlan = async (req, res, next) => {
  try {
    const plan = await DietPlan.findByIdAndDelete(req.params.id);
    if (!plan) return res.status(404).json({ success: false, message: "Diet plan not found" });
    res.json({ success: true, message: "Deleted" });
  } catch (err) { next(err); }
};
