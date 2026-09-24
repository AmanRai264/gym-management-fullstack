const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/memberController");
const { protect, authorize } = require("../middleware/auth");

const staffRoles = ["super_admin", "gym_owner", "manager", "receptionist"];

router.get("/", protect, ctrl.getMembers);
router.get("/:id", protect, ctrl.getMember);
router.post("/", protect, authorize(...staffRoles), ctrl.createMember);
router.put("/:id", protect, authorize(...staffRoles), ctrl.updateMember);
router.delete("/:id", protect, authorize("super_admin", "gym_owner", "manager"), ctrl.deleteMember);
router.post("/:id/renew", protect, authorize(...staffRoles), ctrl.renewMembership);
router.post("/:id/freeze", protect, authorize(...staffRoles), ctrl.freezeMembership);
router.post("/:id/cancel", protect, authorize(...staffRoles), ctrl.cancelMembership);

module.exports = router;
