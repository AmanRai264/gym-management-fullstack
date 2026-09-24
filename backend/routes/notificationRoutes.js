const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/notificationController");
const { protect } = require("../middleware/auth");

router.get("/", protect, ctrl.getNotifications);
router.patch("/:id/read", protect, ctrl.markRead);
router.patch("/read-all", protect, ctrl.markAllRead);

module.exports = router;
