const express = require("express");

const {
  getBillingStatus,
  createOrder,
  verifyPayment,
} = require("../controllers/billingController");

const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// Billing status
router.get("/status", authMiddleware, getBillingStatus);

// Create Razorpay order
router.post("/create-order", authMiddleware, createOrder);

// Verify Razorpay payment
router.post("/verify", authMiddleware, verifyPayment);

module.exports = router;
