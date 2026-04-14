const router = require('express').Router();
const User = require('../models/User');
const { protect } = require('../middleware/auth');

// Register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    const user = await User.create({ name, email, password, phone });
    const token = user.generateToken();

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    if (!user.isActive) {
      return res.status(403).json({ success: false, message: 'Account has been deactivated' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const token = user.generateToken();

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        addresses: user.addresses,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get current user
router.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        addresses: user.addresses,
        avatar: user.avatar,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update profile
router.put('/profile', protect, async (req, res) => {
  try {
    const { name, phone, avatar } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name, phone, avatar },
      { new: true, runValidators: true }
    );

    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Add address
router.post('/address', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (req.body.isDefault) {
      user.addresses.forEach((addr) => (addr.isDefault = false));
    }
    user.addresses.push(req.body);
    await user.save();
    res.json({ success: true, addresses: user.addresses });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update address
router.put('/address/:addressId', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const address = user.addresses.id(req.params.addressId);
    if (!address) {
      return res.status(404).json({ success: false, message: 'Address not found' });
    }
    if (req.body.isDefault) {
      user.addresses.forEach((addr) => (addr.isDefault = false));
    }
    Object.assign(address, req.body);
    await user.save();
    res.json({ success: true, addresses: user.addresses });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Delete address
router.delete('/address/:addressId', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    user.addresses.pull(req.params.addressId);
    await user.save();
    res.json({ success: true, addresses: user.addresses });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Change password
router.put('/change-password', protect, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id).select('+password');

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Current password is incorrect' });
    }

    user.password = newPassword;
    await user.save();

    res.json({ success: true, message: 'Password changed successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Firebase Login & Registration logic
router.post('/firebase-login', async (req, res) => {
  try {
    const { token } = req.body;
    let decodedToken;
    let uid, email, phone, name;

    if (!process.env.FIREBASE_PROJECT_ID) {
      // Dummy Mode: Parse from raw base64 or just use test values
      // Standard JWT has 3 parts. Let's just mock it if it's "dummy_token"
      decodedToken = {
        uid: 'dummy_' + Date.now(),
        phone_number: req.body.phone || undefined,
        email: req.body.email || undefined,
        name: req.body.name || 'Test User'
      };
    } else {
      const { admin } = require('../config/firebase-admin');
      if (!admin) return res.status(500).json({ success: false, message: 'Firebase not configured properly' });
      decodedToken = await admin.auth().verifyIdToken(token);
    }
    
    uid = decodedToken.uid;
    email = decodedToken.email;
    phone = decodedToken.phone_number;
    name = decodedToken.name || (email ? email.split('@')[0] : 'User');

    // Find User by Firebase UID first
    let user = await User.findOne({ firebaseUid: uid }).select('+password');
    
    // If not found, attempt to link via email or phone
    if (!user) {
      if (email) user = await User.findOne({ email }).select('+password');
      else if (phone) user = await User.findOne({ phone }).select('+password');
      
      if (user) {
        // Link account
        user.firebaseUid = uid;
        // Optionally update missing info
        if (!user.phone && phone) user.phone = phone;
        await user.save();
      } else {
        // Create new user
        user = await User.create({
          name,
          email,
          phone,
          firebaseUid: uid,
          // Generate dummy password to satisfy any legacy hooks, though we made it optional
          password: 'fb_' + Math.random().toString(36).slice(-8)
        });
      }
    }

    if (!user.isActive) {
      return res.status(403).json({ success: false, message: 'Account has been deactivated' });
    }

    // Generate App Token using existing logic
    const appToken = user.generateToken();

    res.json({
      success: true,
      token: appToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        addresses: user.addresses,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
