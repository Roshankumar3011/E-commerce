const router = require('express').Router();
const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const { protect } = require('../middleware/auth');

// Place order
router.post('/', protect, async (req, res) => {
  try {
    const { shippingAddress, paymentMethod = 'COD' } = req.body;

    const cart = await Cart.findOne({ user: req.user._id }).populate('items.product');
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ success: false, message: 'Cart is empty' });
    }

    // Build order items with price at purchase
    const orderItems = cart.items.map((item) => {
      if (!item.product) {
        throw new Error(`Product not found for item in cart`);
      }
      return {
        product: item.product._id,
        name: item.product.name,
        image: item.product.images?.[0] || '',
        size: item.size,
        ...(item.color && { color: item.color }),
        quantity: item.quantity,
        priceAtPurchase: item.price || item.product.price || 0,
        totalPrice: (item.price || item.product.price || 0) * item.quantity,
      };
    });

    const subtotal = orderItems.reduce((sum, item) => sum + (item.totalPrice || 0), 0);
    const shippingCharge = subtotal >= 499 ? 0 : 40;
    const totalAmount = subtotal + shippingCharge;

    const order = await Order.create({
      user: req.user._id,
      items: orderItems,
      shippingAddress,
      paymentMethod,
      paymentStatus: 'Pending',
      orderStatus: 'Pending',
      statusHistory: [{ status: 'Pending', note: 'Order placed' }],
      subtotal,
      shippingCharge,
      totalAmount,
    });

    // Update stock
    for (const item of cart.items) {
      if (!item.product) continue;
      
      const product = await Product.findById(item.product._id);
      if (!product || !product.sizes) continue;

      const sizeIndex = product.sizes.findIndex((s) => s.size === item.size);
      if (sizeIndex > -1) {
        product.sizes[sizeIndex].stock = Math.max(0, product.sizes[sizeIndex].stock - item.quantity);
        await product.save();
      }
    }

    // Clear cart
    cart.items = [];
    await cart.save();

    res.status(201).json({ success: true, order });
  } catch (error) {
    console.error('Order Creation Error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Internal Server Error',
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Get user orders
router.get('/my-orders', protect, async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const total = await Order.countDocuments({ user: req.user._id });
    const orders = await Order.find({ user: req.user._id })
      .sort('-createdAt')
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit))
      .populate('items.product', 'name images');

    res.json({
      success: true,
      orders,
      pagination: { page: Number(page), total, pages: Math.ceil(total / Number(limit)) },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get single order
router.get('/:id', protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('items.product', 'name images');
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Check ownership or admin
    if (order.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    res.json({ success: true, order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Cancel order
router.put('/:id/cancel', protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    if (['Shipped', 'Delivered'].includes(order.orderStatus)) {
      return res.status(400).json({ success: false, message: 'Cannot cancel shipped/delivered orders' });
    }

    order.orderStatus = 'Cancelled';
    order.statusHistory.push({ status: 'Cancelled', note: 'Cancelled by user' });

    // Restore stock
    for (const item of order.items) {
      const product = await Product.findById(item.product);
      if (product) {
        const sizeIndex = product.sizes.findIndex((s) => s.size === item.size);
        if (sizeIndex > -1) {
          product.sizes[sizeIndex].stock += item.quantity;
          await product.save();
        }
      }
    }

    await order.save();
    res.json({ success: true, order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
