const router = require('express').Router();
const User = require('../models/User');
const Otp = require('../models/Otp');
const { protect } = require('../middleware/auth');
const sendEmail = require('../utils/sendEmail');
const sendSMS = require('../utils/sendSMS');
const { admin } = require('../config/firebase-admin');

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

// Send OTP (Email or Phone)
router.post('/send-otp', async (req, res) => {
  try {
    const { receiver, type } = req.body;
    if (!receiver || !type) {
      return res.status(400).json({ success: false, message: 'Please provide receiver and type' });
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();

    await Otp.findOneAndUpdate(
      { receiver },
      { code, type, expiresAt: new Date(Date.now() + 10 * 60 * 1000) },
      { upsert: true, new: true }
    );

    if (type === 'email') {
      await sendEmail({
        email: receiver,
        subject: 'Balajee Store - Your Verification Code',
        message: `Your verification code is ${code}. It is valid for 10 minutes.`,
        html: `<h3>Verification Code</h3><p>Your code is <strong>${code}</strong>. It expires in 10 minutes.</p>`
      });
    } else {
      await sendSMS({ number: receiver, code });
    }

    res.json({ success: true, message: 'OTP sent successfully' });
  } catch (error) {
    console.error('Send OTP Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Verify OTP
router.post('/verify-otp', async (req, res) => {
  try {
    const { receiver, code } = req.body;
    if (!receiver || !code) {
      return res.status(400).json({ success: false, message: 'Please provide receiver and code' });
    }

    const otpData = await Otp.findOne({ receiver, code });
    if (!otpData) {
      return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
    }

    await Otp.deleteOne({ _id: otpData._id });

    let user = await User.findOne({ $or: [{ email: receiver }, { phone: receiver }] });

    if (!user) {
      return res.json({ 
        success: true, 
        message: 'OTP verified. New user.', 
        userExists: false 
      });
    }

    if (!user.isActive) {
      return res.status(403).json({ success: false, message: 'Account is deactivated' });
    }

    const token = user.generateToken();
    res.json({
      success: true,
      message: 'Logged in successfully',
      userExists: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Firebase/Google Login
router.post('/firebase-login', async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) {
      return res.status(400).json({ success: false, message: 'No token provided' });
    }

    let decodedToken;
    try {
      const { getIsFirebaseInitialized } = require('../config/firebase-admin');
      
      if (getIsFirebaseInitialized()) {
        decodedToken = await admin.auth().verifyIdToken(token);
      } else {
        console.warn('⚠️ Firebase initialization check failed in login route.');
        return res.status(503).json({ 
          success: false, 
          message: 'Firebase authentication is not fully configured. Please check your server/.env file for FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL and FIREBASE_PRIVATE_KEY.' 
        });
      }
    } catch (err) {
      console.error('Firebase Token Error:', err.message);
      return res.status(401).json({ success: false, message: 'Invalid Firebase token' });
    }

    const { email, name, picture } = decodedToken;

    let user = await User.findOne({ email });

    if (!user) {
      user = await User.create({
        name: name || 'Google User',
        email: email,
        password: Math.random().toString(36).slice(-10),
        avatar: picture,
        role: 'user',
        isActive: true
      });
    }

    if (!user.isActive) {
      return res.status(403).json({ success: false, message: 'Account is deactivated' });
    }

    const jwtToken = user.generateToken();

    res.json({
      success: true,
      token: jwtToken,
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
    console.error('Firebase Login Error:', error);
    res.status(500).json({ success: false, message: 'Firebase login failed' });
  }
});

module.exports = router;
