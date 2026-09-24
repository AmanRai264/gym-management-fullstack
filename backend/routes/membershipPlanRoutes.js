const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/membershipPlanController");
const { protect, authorize } = require("../middleware/auth");

const staffRoles = ["super_admin", "gym_owner", "manager"];

router.get("/", protect, ctrl.getPlans);
router.post("/", protect, authorize(...staffRoles), ctrl.createPlan);
router.put("/:id", protect, authorize(...staffRoles), ctrl.updatePlan);
router.delete("/:id", protect, authorize(...staffRoles), ctrl.deletePlan);
router.patch("/:id/toggle", protect, authorize(...staffRoles), ctrl.togglePlanStatus);

module.exports = router;
