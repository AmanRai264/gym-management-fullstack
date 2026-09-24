const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/reportController");
const { protect, authorize } = require("../middleware/auth");

const staffRoles = ["super_admin", "gym_owner", "manager"];

router.get("/revenue", protect, authorize(...staffRoles), ctrl.revenueReport);
router.get("/membership", protect, authorize(...staffRoles), ctrl.membershipReport);
router.get("/attendance", protect, authorize(...staffRoles), ctrl.attendanceReport);
router.get("/expense", protect, authorize(...staffRoles), ctrl.expenseReport);

module.exports = router;
