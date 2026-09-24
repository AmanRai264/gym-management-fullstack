const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/trainerController");
const { protect, authorize } = require("../middleware/auth");

const staffRoles = ["super_admin", "gym_owner", "manager"];

router.get("/", protect, ctrl.getTrainers);
router.get("/:id", protect, ctrl.getTrainer);
router.post("/", protect, authorize(...staffRoles), ctrl.createTrainer);
router.put("/:id", protect, authorize(...staffRoles), ctrl.updateTrainer);
router.delete("/:id", protect, authorize(...staffRoles), ctrl.deleteTrainer);

module.exports = router;
