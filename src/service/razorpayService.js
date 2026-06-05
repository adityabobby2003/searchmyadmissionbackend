import Razorpay from "razorpay";
import crypto from "crypto";
import Payment from "../model/paymentModel.js";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

export const checkUserPayment = async ({
  email, exam, course, rank, region, category
}) => {
  const record = await Payment.findOne({
    where: { 
      email, 
      exam, 
      course, 
      rank, 
      region, 
      category,
      payment_status: "completed"
    }
  });

  return !!record;
};

/**
 * Create a Razorpay order for payment
 */
export const createRazorpayOrder = async ({
  email, exam, course, rank, region, category, amount
}) => {
  try {
    // Check if user already paid
    const isPaid = await checkUserPayment({
      email, exam, course, rank, region, category
    });

    if (isPaid) {
      throw new Error("User has already completed payment for this course");
    }

    const amountInPaise = Math.round(amount * 100);

    const orderOptions = {
      amount: amountInPaise,
      currency: "INR",
      receipt: `ord_${Date.now().toString().slice(-8)}`,
      notes: {
        email,
        exam,
        course,
        rank,
        region,
        category
      }
    };

    const order = await razorpay.orders.create(orderOptions);

    return {
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      receipt: order.receipt
    };
  } catch (error) {
    console.error("Error creating Razorpay order:", error);
    throw new Error(`Failed to create order: ${error.message}`);
  }
};

/**
 * Verify Razorpay payment signature
 */
export const verifyPaymentSignature = ({
  razorpay_order_id,
  razorpay_payment_id,
  razorpay_signature
}) => {
  const shasum = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET);
  shasum.update(`${razorpay_order_id}|${razorpay_payment_id}`);
  const digest = shasum.digest("hex");

  return digest === razorpay_signature;
};

/**
 * Create and verify payment entry
 */
export const createPaymentEntry = async ({
  email, exam, course, rank, region, category, amount,
  razorpay_order_id, razorpay_payment_id, razorpay_signature
}) => {
  try {
    // Verify signature
    const isValidSignature = verifyPaymentSignature({
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    });

    if (!isValidSignature) {
      throw new Error("Invalid payment signature. Payment verification failed.");
    }

    // Check if payment already exists
    const existingPayment = await Payment.findOne({
      where: { 
        email, 
        exam, 
        course, 
        rank, 
        region, 
        category,
        payment_status: "completed"
      }
    });

    if (existingPayment) {
      throw new Error("Payment already exists for this course");
    }

    // Create payment record
    const payment = await Payment.create({
      email,
      exam,
      course,
      rank,
      region,
      category,
      amount,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      paid_at: new Date(),
      payment_status: "completed"
    });

    return {
      success: true,
      payment,
      message: "Payment recorded successfully"
    };
  } catch (error) {
    console.error("Error creating payment entry:", error);
    throw new Error(`Failed to record payment: ${error.message}`);
  }
};

/**
 * Get payment details
 */
export const getPaymentDetails = async (razorpay_payment_id) => {
  try {
    const payment = await razorpay.payments.fetch(razorpay_payment_id);
    return payment;
  } catch (error) {
    console.error("Error fetching payment details:", error);
    throw new Error(`Failed to fetch payment: ${error.message}`);
  }
};

/**
 * Refund a payment
 */
export const refundPayment = async (razorpay_payment_id, amount = null) => {
  try {
    const refundOptions = {};

    if (amount) {
      refundOptions.amount = Math.round(amount * 100);
    }

    const refund = await razorpay.payments.refund(
      razorpay_payment_id,
      refundOptions
    );

    return {
      success: true,
      refund,
      message: "Refund initiated successfully"
    };
  } catch (error) {
    console.error("Error processing refund:", error);
    throw new Error(`Failed to process refund: ${error.message}`);
  }
};