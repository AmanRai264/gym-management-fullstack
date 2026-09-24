const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/dietController");
const { protect } = require("../middleware/auth");

router.get("/", protect, ctrl.getDietPlans);
router.post("/", protect, ctrl.createDietPlan);
router.put("/:id", protect, ctrl.updateDietPlan);
router.delete("/:id", protect, ctrl.deleteDietPlan);

module.exports = router;
