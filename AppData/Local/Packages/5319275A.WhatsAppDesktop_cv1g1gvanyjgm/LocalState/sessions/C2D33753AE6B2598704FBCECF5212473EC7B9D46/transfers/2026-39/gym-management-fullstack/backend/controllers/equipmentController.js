const Equipment = require("../models/Equipment");

exports.getEquipment = async (req, res, next) => {
  try {
    const { status, search } = req.query;
    const query = {};
    if (status) query.status = status;
    if (search) query.name = { $regex: search, $options: "i" };
    const items = await Equipment.find(query).sort("-createdAt");
    res.json({ success: true, data: items });
  } catch (err) { next(err); }
};

exports.createEquipment = async (req, res, next) => {
  try {
    const item = await Equipment.create(req.body);
    res.status(201).json({ success: true, data: item });
  } catch (err) { next(err); }
};

exports.updateEquipment = async (req, res, next) => {
  try {
    const item = await Equipment.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!item) return res.status(404).json({ success: false, message: "Equipment not found" });
    res.json({ success: true, data: item });
  } catch (err) { next(err); }
};

exports.deleteEquipment = async (req, res, next) => {
  try {
    const item = await Equipment.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: "Equipment not found" });
    res.json({ success: true, message: "Deleted" });
  } catch (err) { next(err); }
};
