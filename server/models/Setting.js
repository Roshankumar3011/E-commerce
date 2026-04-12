const mongoose = require('mongoose');

const bannerSchema = new mongoose.Schema({
  image: { type: String },
  text: { type: String, required: true },
  subtext: { type: String },
  color: { type: String, default: 'linear-gradient(135deg, #10b981, #3b82f6)' }
});

const settingSchema = new mongoose.Schema({
  logoUrl: { type: String, default: '' },
  contact: {
    email: { type: String, default: 'support@flipstyle.com' },
    phone: { type: String, default: '+91 1800-123-4567' },
    address: { type: String, default: 'Mumbai, India' }
  },
  socialLinks: {
    facebook: { type: String, default: '#' },
    twitter: { type: String, default: '#' },
    linkedin: { type: String, default: '#' },
    instagram: { type: String, default: '#' }
  },
  banners: {
    type: [bannerSchema],
    default: [
      { image: '', text: "BUY 1 GET 1 FREE", subtext: "On Bestsellers", color: "linear-gradient(135deg, #6366f1, #a855f7)" },
      { image: '', text: "FLAT ₹500 OFF", subtext: "On orders above ₹1499", color: "linear-gradient(135deg, #f43f5e, #fb923c)" },
      { image: '', text: "EXTRA 10% OFF", subtext: "For VIP Members", color: "linear-gradient(135deg, #06b6d4, #0ea5e9)" },
    ]
  }
}, { timestamps: true });

module.exports = mongoose.model('Setting', settingSchema);
