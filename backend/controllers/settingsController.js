const GymSettings = require("../models/GymSettings");

exports.getSettings = async (req, res, next) => {
  try {
    let settings = await GymSettings.findOne();
    if (!settings) settings = await GymSettings.create({});
    res.json({ success: true, data: settings });
  } catch (err) { next(err); }
};

exports.updateSettings = async (req, res, next) => {
  try {
    let settings = await GymSettings.findOne();
    if (!settings) {
      settings = await GymSettings.create(req.body);
    } else {
      Object.assign(settings, req.body);
      await settings.save();
    }
    res.json({ success: true, data: settings });
  } catch (err) { next(err); }
};
