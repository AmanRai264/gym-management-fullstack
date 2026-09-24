const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/expenseController");
const { protect, authorize } = require("../middleware/auth");

const staffRoles = ["super_admin", "gym_owner", "manager"];

router.get("/", protect, authorize(...staffRoles), ctrl.getExpenses);
router.post("/", protect, authorize(...staffRoles), ctrl.createExpense);
router.delete("/:id", protect, authorize(...staffRoles), ctrl.deleteExpense);
router.get("/profit-summary", protect, authorize(...staffRoles), ctrl.getProfitSummary);

module.exports = router;
