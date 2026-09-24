const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/staffController");
const { protect, authorize } = require("../middleware/auth");

const staffRoles = ["super_admin", "gym_owner"];

router.get("/", protect, authorize(...staffRoles, "manager"), ctrl.getStaff);
router.put("/:id", protect, authorize(...staffRoles), ctrl.updateStaff);
router.delete("/:id", protect, authorize(...staffRoles), ctrl.deleteStaff);

module.exports = router;
