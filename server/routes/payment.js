const router = require('express').Router();
const crypto = require('crypto');
const axios = require('axios');
const Razorpay = require('razorpay');
const Order = require('../models/Order');
const { protect } = require('../middleware/auth');

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_dummy_key',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'dummy_secret',
});

// Create Razorpay Order
router.post('/razorpay/create-order', protect, async (req, res) => {
  try {
    const { amount, orderId } = req.body;

    // Check if keys are placeholders (Dummy Mode)
    const isDummy = !process.env.RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID.includes('your_razorpay_key_id');

    if (isDummy) {
      console.log('⚠️ Using Dummy Razorpay Mode');
      const dummyId = 'order_sim_' + crypto.randomBytes(8).toString('hex');
      if (orderId) {
        await Order.findByIdAndUpdate(orderId, { razorpayOrderId: dummyId });
      }
      return res.json({ 
        success: true, 
        id: dummyId, 
        amount: amount * 100, 
        currency: 'INR',
        isDummy: true 
      });
    }

    const options = {
      amount: Math.round(amount * 100), // amount in the smallest currency unit
      currency: 'INR',
      receipt: `receipt_${orderId}`,
    };

    const razorpayOrder = await razorpay.orders.create(options);

    if (orderId) {
      await Order.findByIdAndUpdate(orderId, { razorpayOrderId: razorpayOrder.id });
    }

    res.json({
      success: true,
      id: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency
    });
  } catch (error) {
    console.error('Razorpay Order Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Verify Razorpay Payment
router.post('/razorpay/verify', protect, async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId } = req.body;

    // Mock verification for dummy keys
    const isDummy = !process.env.RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID.includes('your_razorpay_key_id');

    if (isDummy) {
      const order = await Order.findById(orderId);
      if (order) {
        order.paymentStatus = 'Paid';
        order.paymentId = razorpay_payment_id || 'pay_sim_' + Date.now();
        order.orderStatus = 'Confirmed';
        order.statusHistory.push({ status: 'Confirmed', note: 'Payment successful (Simulated)' });
        await order.save();
      }
      return res.json({ success: true, message: 'Payment verified (Simulated)' });
    }

    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest('hex');

    if (expectedSignature === razorpay_signature) {
      const order = await Order.findById(orderId);
      if (order) {
        order.paymentStatus = 'Paid';
        order.paymentId = razorpay_payment_id;
        order.orderStatus = 'Confirmed';
        order.statusHistory.push({ status: 'Confirmed', note: 'Razorpay Payment Confirmed' });
        await order.save();
      }
      res.json({ success: true, message: 'Payment verified successfully' });
    } else {
      res.status(400).json({ success: false, message: 'Invalid payment signature' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Create PhonePe Order (Keeping existing logic just in case)
router.post('/create-order', protect, async (req, res) => {
  // ... (Existing PhonePe logic stays here) ...
});

// ... (Rest of existing payment logic) ...

module.exports = router;
