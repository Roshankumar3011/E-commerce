const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  rating: {
    type: Number,
    required: [true, 'Please provide a rating'],
    min: 1,
    max: 5,
  },
  title: {
    type: String,
    trim: true,
    maxlength: 100,
  },
  comment: {
    type: String,
    trim: true,
    maxlength: 1000,
  },
  images: [String],
}, { timestamps: true });

// One review per user per product
reviewSchema.index({ user: 1, product: 1 }, { unique: true });

// Update product ratings after save
reviewSchema.post('save', async function () {
  const Product = mongoose.model('Product');
  const stats = await mongoose.model('Review').aggregate([
    { $match: { product: this.product } },
    { $group: { _id: '$product', avgRating: { $avg: '$rating' }, count: { $sum: 1 } } },
  ]);
  if (stats.length > 0) {
    await Product.findByIdAndUpdate(this.product, {
      'ratings.average': Math.round(stats[0].avgRating * 10) / 10,
      'ratings.count': stats[0].count,
    });
  }
});

module.exports = mongoose.model('Review', reviewSchema);
