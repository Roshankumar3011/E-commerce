const router = require('express').Router();
const crypto = require('crypto');
const Order = require('../models/Order');
const { protect } = require('../middleware/auth');

// Create Razorpay order (dummy implementation)
router.post('/create-order', protect, async (req, res) => {
  try {
    const { amount, orderId } = req.body;

    // Dummy Razorpay order simulation
    const razorpayOrderId = 'order_' + crypto.randomBytes(10).toString('hex');

    // Update order with razorpay order ID
    if (orderId) {
      await Order.findByIdAndUpdate(orderId, { razorpayOrderId });
    }

    res.json({
      success: true,
      order: {
        id: razorpayOrderId,
        amount: amount * 100, // Razorpay expects paise
        currency: 'INR',
        receipt: orderId,
      },
      key: process.env.RAZORPAY_KEY_ID || 'rzp_test_dummy',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Verify payment (dummy implementation)
router.post('/verify', protect, async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId } = req.body;

    // In production, verify with Razorpay SDK
    // For dummy: simulate successful payment
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    order.paymentStatus = 'Paid';
    order.paymentId = razorpay_payment_id || 'pay_' + crypto.randomBytes(10).toString('hex');
    order.razorpayOrderId = razorpay_order_id;
    order.razorpaySignature = razorpay_signature || 'sig_dummy';
    order.orderStatus = 'Confirmed';
    order.statusHistory.push({ status: 'Confirmed', note: 'Payment successful' });

    await order.save();

    res.json({ success: true, message: 'Payment verified successfully', order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
