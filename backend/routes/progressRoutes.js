const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/progressController");
const { protect } = require("../middleware/auth");

router.get("/", protect, ctrl.getProgress);
router.post("/", protect, ctrl.addProgress);
router.delete("/:id", protect, ctrl.deleteProgress);

module.exports = router;
