const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
  receiver: {
    type: String,
    required: true,
  },
  code: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ['email', 'phone'],
    required: true,
  },
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
    index: { expires: '0s' }, // TTL index
  },
}, { timestamps: true });

module.exports = mongoose.model('Otp', otpSchema);
