const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/equipmentController");
const { protect, authorize } = require("../middleware/auth");

const staffRoles = ["super_admin", "gym_owner", "manager"];

router.get("/", protect, ctrl.getEquipment);
router.post("/", protect, authorize(...staffRoles), ctrl.createEquipment);
router.put("/:id", protect, authorize(...staffRoles), ctrl.updateEquipment);
router.delete("/:id", protect, authorize(...staffRoles), ctrl.deleteEquipment);

module.exports = router;
