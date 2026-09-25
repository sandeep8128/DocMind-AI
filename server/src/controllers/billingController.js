const Razorpay = require("razorpay");
const crypto = require("crypto");
const User = require("../models/User");

// ======================================================
// 🔴 FREE PLAN LIMITS
// ======================================================
// CHANGE THESE VALUES LATER IF NEEDED
// ======================================================

// Free user lifetime PDF uploads
const FREE_UPLOAD_LIMIT = 5;

// Free user maximum PDF size
const FREE_MAX_FILE_SIZE_MB = 20;

// Pro user maximum PDF size
const PRO_MAX_FILE_SIZE_MB = 500;

// ======================================================
// RAZORPAY
// ======================================================

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// ==========================================
// BILLING STATUS
// GET /api/billing/status
// ==========================================

const getBillingStatus = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select(
      "plan planActivatedAt uploadCount"
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const isPro = user.plan === "pro";

    return res.status(200).json({
      success: true,

      plan: user.plan,

      planActivatedAt: user.planActivatedAt,

      // ==========================================
      // USAGE
      // ==========================================

      usage: {
        // Current lifetime PDF uploads
        uploads: user.uploadCount,

        // Free = 5
        // Pro = null means unlimited
        maxUploads: isPro ? null : FREE_UPLOAD_LIMIT,

        questionsThisMonth: 0,

        maxQuestionsPerMonth: isPro ? null : 20,
      },

      // ==========================================
      // LIMITS
      // ==========================================

      limits: {
        // Free = 5
        // Pro = null means unlimited
        maxDocuments: isPro ? null : FREE_UPLOAD_LIMIT,

        // PDF size
        maxFileSizeMB: isPro
          ? PRO_MAX_FILE_SIZE_MB
          : FREE_MAX_FILE_SIZE_MB,

        multiDocChat: isPro,

        exportChat: isPro,
      },
    });
  } catch (error) {
    console.error("Billing Status Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch billing status",
    });
  }
};

// ==========================================
// CREATE RAZORPAY ORDER
// POST /api/billing/create-order
// ==========================================

const createOrder = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // ==========================================
    // ALREADY PRO
    // ==========================================

    if (user.plan === "pro") {
      return res.status(400).json({
        success: false,
        message: "You are already on the Pro plan",
      });
    }

    // ==========================================
    // 💰 PRO PLAN PRICE
    // ==========================================
    //
    // Currently ₹59
    //
    // Razorpay amount is in paise.
    // ₹59 × 100 = 5900 paise
    //
    // 🔴 CHANGE THIS NUMBER LATER IF NEEDED
    // ==========================================

    const PRO_PLAN_PRICE_INR = 59;

    const amount = PRO_PLAN_PRICE_INR * 100;

    const options = {
      amount,

      currency: "INR",

      receipt: `docmind_${user._id}_${Date.now()}`,

      notes: {
        userId: user._id.toString(),

        plan: "pro",
      },
    };

    const order = await razorpay.orders.create(options);

    return res.status(200).json({
      success: true,

      orderId: order.id,

      amount: order.amount,

      currency: order.currency,

      keyId: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    console.error(
      "Create Razorpay Order Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to create payment order",
    });
  }
};

// ==========================================
// VERIFY PAYMENT
// POST /api/billing/verify-payment
// ==========================================

const verifyPayment = async (req, res) => {
  try {
    const {
      orderId,
      paymentId,
      razorpayOrderId,
      signature,
    } = req.body;

    // ==========================================
    // VALIDATE PAYMENT DATA
    // ==========================================

    if (
      !orderId ||
      !paymentId ||
      !razorpayOrderId ||
      !signature
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Payment verification data is incomplete",
      });
    }

    // ==========================================
    // VERIFY ORDER ID
    // ==========================================

    if (orderId !== razorpayOrderId) {
      return res.status(400).json({
        success: false,
        message: "Invalid Razorpay order",
      });
    }

    // ==========================================
    // GENERATE EXPECTED SIGNATURE
    // ==========================================

    const generatedSignature = crypto
      .createHmac(
        "sha256",
        process.env.RAZORPAY_KEY_SECRET
      )
      .update(`${orderId}|${paymentId}`)
      .digest("hex");

    // ==========================================
    // COMPARE SIGNATURES
    // ==========================================

    if (generatedSignature !== signature) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment signature",
      });
    }

    // ==========================================
    // GET USER
    // ==========================================

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // ==========================================
    // ACTIVATE PRO
    // ==========================================

    user.plan = "pro";

    user.planActivatedAt = new Date();

    await user.save();

    // ==========================================
    // SUCCESS RESPONSE
    // ==========================================

    return res.status(200).json({
      success: true,

      message: "Payment verified successfully",

      plan: user.plan,

      planActivatedAt: user.planActivatedAt,

      usage: {
        uploads: user.uploadCount,

        maxUploads: null,
      },

      limits: {
        maxFileSizeMB: PRO_MAX_FILE_SIZE_MB,

        maxDocuments: null,

        multiDocChat: true,

        exportChat: true,
      },
    });
  } catch (error) {
    console.error(
      "Payment Verification Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Payment verification failed",
    });
  }
};

// ==========================================
// EXPORTS
// ==========================================

module.exports = {
  getBillingStatus,
  createOrder,
  verifyPayment,
};