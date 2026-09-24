const WorkoutPlan = require("../models/WorkoutPlan");

exports.getWorkoutPlans = async (req, res, next) => {
  try {
    const { member, category } = req.query;
    const query = {};
    if (member) query.member = member;
    if (category) query.category = category;
    const plans = await WorkoutPlan.find(query).populate("member", "fullName memberId").populate("trainer", "name").sort("-createdAt");
    res.json({ success: true, data: plans });
  } catch (err) { next(err); }
};

exports.createWorkoutPlan = async (req, res, next) => {
  try {
    const plan = await WorkoutPlan.create(req.body);
    res.status(201).json({ success: true, data: plan });
  } catch (err) { next(err); }
};

exports.updateWorkoutPlan = async (req, res, next) => {
  try {
    const plan = await WorkoutPlan.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!plan) return res.status(404).json({ success: false, message: "Workout plan not found" });
    res.json({ success: true, data: plan });
  } catch (err) { next(err); }
};

exports.deleteWorkoutPlan = async (req, res, next) => {
  try {
    const plan = await WorkoutPlan.findByIdAndDelete(req.params.id);
    if (!plan) return res.status(404).json({ success: false, message: "Workout plan not found" });
    res.json({ success: true, message: "Deleted" });
  } catch (err) { next(err); }
};
