import express from 'express';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import Order from '../models/Order.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

// Check if Razorpay is configured
const isRazorpayConfigured = process.env.RAZORPAY_KEY_ID &&
  process.env.RAZORPAY_KEY_SECRET &&
  process.env.RAZORPAY_KEY_ID !== 'your_razorpay_key_id';

let razorpay = null;
if (isRazorpayConfigured) {
  razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
  });
}

// Create Razorpay order
router.post('/create', auth, async (req, res) => {
  try {
    const { orderId } = req.body;

    const order = await Order.findOne({ _id: orderId, userId: req.user._id });
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Test mode - skip Razorpay if not configured
    if (!isRazorpayConfigured) {
      order.razorpayOrderId = 'test_' + Date.now();
      await order.save();
      return res.json({
        orderId: order.razorpayOrderId,
        amount: order.price * 100,
        currency: 'INR',
        key: 'test_mode',
        testMode: true
      });
    }

    const razorpayOrder = await razorpay.orders.create({
      amount: order.price * 100,
      currency: 'INR',
      receipt: order._id.toString()
    });

    order.razorpayOrderId = razorpayOrder.id;
    await order.save();

    res.json({
      orderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      key: process.env.RAZORPAY_KEY_ID,
      testMode: false
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Verify payment
router.post('/verify', auth, async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, testMode } = req.body;

    // Test mode - auto verify
    if (testMode || razorpay_order_id?.startsWith('test_')) {
      const order = await Order.findOne({ razorpayOrderId: razorpay_order_id });
      if (!order) {
        return res.status(404).json({ error: 'Order not found' });
      }
      order.paymentId = 'test_payment_' + Date.now();
      order.status = 'paid';
      await order.save();
      return res.json({ message: 'Test payment successful', order });
    }

    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ error: 'Invalid payment signature' });
    }

    const order = await Order.findOne({ razorpayOrderId: razorpay_order_id });
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    order.paymentId = razorpay_payment_id;
    order.status = 'paid';
    await order.save();

    res.json({ message: 'Payment verified successfully', order });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
