const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/announcementController");
const { protect, authorize } = require("../middleware/auth");

router.get("/", protect, ctrl.getAnnouncements);
router.post("/", protect, authorize("super_admin", "gym_owner", "manager"), ctrl.createAnnouncement);
router.delete("/:id", protect, authorize("super_admin", "gym_owner", "manager"), ctrl.deleteAnnouncement);

module.exports = router;
