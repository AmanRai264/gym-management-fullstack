const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/attendanceController");
const { protect } = require("../middleware/auth");

router.post("/checkin", protect, ctrl.checkIn);
router.put("/:id/checkout", protect, ctrl.checkOut);
router.get("/today", protect, ctrl.getToday);
router.get("/history", protect, ctrl.getHistory);
router.get("/stats", protect, ctrl.getStats);

module.exports = router;
