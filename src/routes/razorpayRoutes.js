import express from "express";
import {
  checkUserPayment,
  createRazorpayOrder,
  createPaymentEntry,
  getPaymentDetails,
  refundPayment
} from "../service/razorpayService.js";

const router = express.Router();

/**
 * Check if user has already paid
 * POST /api/payment/check
 */
router.post("/check", async (req, res) => {
  try {
    const { email, exam, course, rank, region, category } = req.body;

    if (!email || !exam || !course) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: email, exam, course"
      });
    }

    const hasPaid = await checkUserPayment({
      email, exam, course, rank, region, category
    });

    res.json({
      success: true,
      hasPaid
    });
  } catch (error) {
    console.error("Error checking payment:", error);
    res.status(500).json({
      success: false,
      message: "Failed to check payment status",
      error: error.message
    });
  }
});

/**
 * Create Razorpay order
 * POST /api/payment/create-order
 */
router.post("/create-order", async (req, res) => {
  try {
    const { email, exam, course, rank, region, category, amount } = req.body;

    if (!email || !exam || !course || !amount) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: email, exam, course, amount"
      });
    }

    if (isNaN(amount) || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Amount must be a positive number"
      });
    }

    const order = await createRazorpayOrder({
      email, exam, course, rank, region, category, amount
    });

    res.json({
      success: true,
      order,
      keyId: process.env.RAZORPAY_KEY_ID
    });
  } catch (error) {
    console.error("Error creating order:", error);
    res.status(400).json({
      success: false,
      message: "Failed to create payment order",
      error: error.message
    });
  }
});

/**
 * Verify and record payment
 * POST /api/payment/verify
 */
router.post("/verify", async (req, res) => {
  try {
    const {
      email, exam, course, rank, region, category, amount,
      razorpay_order_id, razorpay_payment_id, razorpay_signature
    } = req.body;

    if (!email || !exam || !course || !amount ||
        !razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: "Missing required payment verification fields"
      });
    }

    const result = await createPaymentEntry({
      email, exam, course, rank, region, category, amount,
      razorpay_order_id, razorpay_payment_id, razorpay_signature
    });

    res.json({
      success: true,
      message: result.message,
      payment: result.payment
    });
  } catch (error) {
    console.error("Error verifying payment:", error);
    res.status(400).json({
      success: false,
      message: "Payment verification failed",
      error: error.message
    });
  }
});

/**
 * Get payment details
 * GET /api/payment/:paymentId
 */
router.get("/:paymentId", async (req, res) => {
  try {
    const { paymentId } = req.params;

    if (!paymentId) {
      return res.status(400).json({
        success: false,
        message: "Payment ID is required"
      });
    }

    const payment = await getPaymentDetails(paymentId);

    res.json({
      success: true,
      payment
    });
  } catch (error) {
    console.error("Error fetching payment:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch payment details",
      error: error.message
    });
  }
});

/**
 * Refund a payment
 * POST /api/payment/refund
 */
router.post("/refund", async (req, res) => {
  try {
    const { razorpay_payment_id, amount } = req.body;

    if (!razorpay_payment_id) {
      return res.status(400).json({
        success: false,
        message: "Payment ID is required for refund"
      });
    }

    const result = await refundPayment(razorpay_payment_id, amount);

    res.json(result);
  } catch (error) {
    console.error("Error processing refund:", error);
    res.status(500).json({
      success: false,
      message: "Failed to process refund",
      error: error.message
    });
  }
});

export default router;