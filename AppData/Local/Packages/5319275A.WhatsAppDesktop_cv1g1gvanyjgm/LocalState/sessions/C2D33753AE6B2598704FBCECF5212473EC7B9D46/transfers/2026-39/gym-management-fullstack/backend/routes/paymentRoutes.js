const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/paymentController");
const { protect, authorize } = require("../middleware/auth");

const staffRoles = ["super_admin", "gym_owner", "manager", "receptionist"];

router.get("/", protect, ctrl.getPayments);
router.post("/", protect, authorize(...staffRoles), ctrl.createPayment);
router.patch("/:id/status", protect, authorize(...staffRoles), ctrl.updatePaymentStatus);
router.get("/:id/invoice", protect, ctrl.getInvoice);

module.exports = router;
