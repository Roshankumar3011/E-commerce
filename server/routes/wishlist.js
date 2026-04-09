const router = require('express').Router();
const Wishlist = require('../models/Wishlist');
const { protect } = require('../middleware/auth');

// Get wishlist
router.get('/', protect, async (req, res) => {
  try {
    let wishlist = await Wishlist.findOne({ user: req.user._id }).populate('products', 'name images price originalPrice discount ratings brand');
    if (!wishlist) {
      wishlist = await Wishlist.create({ user: req.user._id, products: [] });
    }
    res.json({ success: true, wishlist });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Toggle wishlist
router.post('/toggle', protect, async (req, res) => {
  try {
    const { productId } = req.body;
    let wishlist = await Wishlist.findOne({ user: req.user._id });

    if (!wishlist) {
      wishlist = new Wishlist({ user: req.user._id, products: [] });
    }

    const index = wishlist.products.indexOf(productId);
    let added = false;
    if (index > -1) {
      wishlist.products.splice(index, 1);
    } else {
      wishlist.products.push(productId);
      added = true;
    }

    await wishlist.save();
    wishlist = await Wishlist.findById(wishlist._id).populate('products', 'name images price originalPrice discount ratings brand');

    res.json({ success: true, added, wishlist });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
