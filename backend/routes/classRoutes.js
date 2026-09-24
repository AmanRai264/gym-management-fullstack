const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/classController");
const { protect, authorize } = require("../middleware/auth");

const staffRoles = ["super_admin", "gym_owner", "manager"];

router.get("/", protect, ctrl.getClasses);
router.post("/", protect, authorize(...staffRoles), ctrl.createClass);
router.put("/:id", protect, authorize(...staffRoles), ctrl.updateClass);
router.delete("/:id", protect, authorize(...staffRoles), ctrl.deleteClass);
router.post("/:id/book", protect, ctrl.bookClass);
router.patch("/bookings/:id/cancel", protect, ctrl.cancelBooking);

module.exports = router;
