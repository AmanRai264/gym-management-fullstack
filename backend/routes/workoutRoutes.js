const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/workoutController");
const { protect } = require("../middleware/auth");

router.get("/", protect, ctrl.getWorkoutPlans);
router.post("/", protect, ctrl.createWorkoutPlan);
router.put("/:id", protect, ctrl.updateWorkoutPlan);
router.delete("/:id", protect, ctrl.deleteWorkoutPlan);

module.exports = router;
