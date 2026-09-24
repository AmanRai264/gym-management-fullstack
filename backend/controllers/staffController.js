const User = require("../models/User");

exports.getStaff = async (req, res, next) => {
  try {
    const staff = await User.find({ role: { $ne: "member" } }).select("-password").sort("-createdAt");
    res.json({ success: true, data: staff });
  } catch (err) { next(err); }
};

exports.updateStaff = async (req, res, next) => {
  try {
    const { password, ...rest } = req.body;
    const user = await User.findByIdAndUpdate(req.params.id, rest, { new: true, runValidators: true }).select("-password");
    if (!user) return res.status(404).json({ success: false, message: "Staff member not found" });
    res.json({ success: true, data: user });
  } catch (err) { next(err); }
};

exports.deleteStaff = async (req, res, next) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: "Staff member not found" });
    res.json({ success: true, message: "Deleted" });
  } catch (err) { next(err); }
};
