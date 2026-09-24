const Progress = require("../models/Progress");

exports.getProgress = async (req, res, next) => {
  try {
    const { member } = req.query;
    const query = {};
    if (member) query.member = member;
    const records = await Progress.find(query).sort("date");
    res.json({ success: true, data: records });
  } catch (err) { next(err); }
};

exports.addProgress = async (req, res, next) => {
  try {
    const payload = { ...req.body };
    if (payload.height && payload.weight) {
      const hM = payload.height / 100;
      payload.bmi = +(payload.weight / (hM * hM)).toFixed(1);
    }
    const record = await Progress.create(payload);
    res.status(201).json({ success: true, data: record });
  } catch (err) { next(err); }
};

exports.deleteProgress = async (req, res, next) => {
  try {
    const record = await Progress.findByIdAndDelete(req.params.id);
    if (!record) return res.status(404).json({ success: false, message: "Progress record not found" });
    res.json({ success: true, message: "Deleted" });
  } catch (err) { next(err); }
};
