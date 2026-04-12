const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
  },
  description: {
    type: String,
    required: [true, 'Product description is required'],
  },
  price: {
    type: Number,
    required: [true, 'Product price is required'],
    min: 0,
  },
  originalPrice: {
    type: Number,
    min: 0,
  },
  discount: {
    type: Number,
    default: 0,
    min: 0,
    max: 100,
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true,
  },
  gender: {
    type: String,
    enum: ['Men', 'Women', 'Kids', 'Unisex'],
    required: true,
  },
  brand: {
    type: String,
    required: true,
    trim: true,
  },
  images: [{
    type: String,
  }],
  sizes: [{
    size: {
      type: String,
      enum: ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'Free Size'],
    },
    stock: {
      type: Number,
      default: 0,
      min: 0,
    },
  }],
  colors: [{
    name: String,
    hexCode: String,
  }],
  material: String,
  season: {
    type: String,
    enum: ['Summer', 'Winter', 'Monsoon', 'Spring', 'All Season'],
    default: 'All Season',
  },
  isFeatured: {
    type: Boolean,
    default: false,
  },
  isPinnedTopDeals: {
    type: Boolean,
    default: false,
  },
  ratings: {
    average: { type: Number, default: 0, min: 0, max: 5 },
    count: { type: Number, default: 0 },
  },
  totalStock: {
    type: Number,
    default: 0,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  tags: [String],
  specifications: [{
    key: String,
    value: String,
  }],
}, { timestamps: true });

// Calculate total stock before saving
productSchema.pre('save', function (next) {
  if (this.sizes && this.sizes.length > 0) {
    this.totalStock = this.sizes.reduce((sum, s) => sum + s.stock, 0);
  }
  if (this.originalPrice && this.price) {
    this.discount = Math.round(((this.originalPrice - this.price) / this.originalPrice) * 100);
  }
  next();
});

// Text index for search
productSchema.index({ name: 'text', description: 'text', brand: 'text', tags: 'text' });
productSchema.index({ category: 1, gender: 1 });
productSchema.index({ price: 1 });

module.exports = mongoose.model('Product', productSchema);
