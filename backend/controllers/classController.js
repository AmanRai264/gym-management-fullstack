const GymClass = require("../models/GymClass");
const Booking = require("../models/Booking");

exports.getClasses = async (req, res, next) => {
  try {
    const { from, to } = req.query;
    const query = {};
    if (from || to) {
      query.date = {};
      if (from) query.date.$gte = new Date(from);
      if (to) query.date.$lte = new Date(to);
    }
    const classes = await GymClass.find(query).populate("trainer", "name").sort("date");
    const withCounts = await Promise.all(
      classes.map(async (c) => {
        const bookedCount = await Booking.countDocuments({ gymClass: c._id, status: "booked" });
        return { ...c.toObject(), bookedCount };
      })
    );
    res.json({ success: true, data: withCounts });
  } catch (err) { next(err); }
};

exports.createClass = async (req, res, next) => {
  try {
    const gymClass = await GymClass.create(req.body);
    res.status(201).json({ success: true, data: gymClass });
  } catch (err) { next(err); }
};

exports.updateClass = async (req, res, next) => {
  try {
    const gymClass = await GymClass.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!gymClass) return res.status(404).json({ success: false, message: "Class not found" });
    res.json({ success: true, data: gymClass });
  } catch (err) { next(err); }
};

exports.deleteClass = async (req, res, next) => {
  try {
    const gymClass = await GymClass.findByIdAndDelete(req.params.id);
    if (!gymClass) return res.status(404).json({ success: false, message: "Class not found" });
    res.json({ success: true, message: "Deleted" });
  } catch (err) { next(err); }
};

exports.bookClass = async (req, res, next) => {
  try {
    const { member } = req.body;
    const gymClass = await GymClass.findById(req.params.id);
    if (!gymClass) return res.status(404).json({ success: false, message: "Class not found" });
    const bookedCount = await Booking.countDocuments({ gymClass: gymClass._id, status: "booked" });
    if (bookedCount >= gymClass.capacity) {
      return res.status(400).json({ success: false, message: "Class is full" });
    }
    const booking = await Booking.create({ gymClass: gymClass._id, member });
    res.status(201).json({ success: true, data: booking });
  } catch (err) { next(err); }
};

exports.cancelBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findByIdAndUpdate(req.params.id, { status: "cancelled" }, { new: true });
    if (!booking) return res.status(404).json({ success: false, message: "Booking not found" });
    res.json({ success: true, data: booking });
  } catch (err) { next(err); }
};
