const Trainer = require("../models/Trainer");
const Member = require("../models/Member");
const generateId = require("../utils/idGenerator");

exports.getTrainers = async (req, res, next) => {
  try {
    const { search, status } = req.query;
    const query = {};
    if (search) query.name = { $regex: search, $options: "i" };
    if (status) query.status = status;
    const trainers = await Trainer.find(query).sort("-createdAt");
    res.json({ success: true, data: trainers });
  } catch (err) {
    next(err);
  }
};

exports.getTrainer = async (req, res, next) => {
  try {
    const trainer = await Trainer.findById(req.params.id);
    if (!trainer) return res.status(404).json({ success: false, message: "Trainer not found" });
    const assignedMembers = await Member.find({ assignedTrainer: trainer._id }).select("fullName memberId status");
    res.json({ success: true, data: { ...trainer.toObject(), assignedMembers } });
  } catch (err) {
    next(err);
  }
};

exports.createTrainer = async (req, res, next) => {
  try {
    const payload = { ...req.body, trainerId: generateId("TRN") };
    const trainer = await Trainer.create(payload);
    res.status(201).json({ success: true, data: trainer });
  } catch (err) {
    next(err);
  }
};

exports.updateTrainer = async (req, res, next) => {
  try {
    const trainer = await Trainer.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!trainer) return res.status(404).json({ success: false, message: "Trainer not found" });
    res.json({ success: true, data: trainer });
  } catch (err) {
    next(err);
  }
};

exports.deleteTrainer = async (req, res, next) => {
  try {
    const trainer = await Trainer.findByIdAndDelete(req.params.id);
    if (!trainer) return res.status(404).json({ success: false, message: "Trainer not found" });
    res.json({ success: true, message: "Trainer deleted" });
  } catch (err) {
    next(err);
  }
};
