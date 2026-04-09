const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Category name is required'],
    trim: true,
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true,
  },
  description: String,
  image: String,
  parent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    default: null,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, { timestamps: true });

categorySchema.pre('save', async function (next) {
  if (this.isModified('name')) {
    let baseSlug = this.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    let uniqueSlug = baseSlug;
    
    // Check if the record has a parent to make slug more unique
    if (this.parent) {
      const parentCat = await mongoose.model('Category').findById(this.parent);
      if (parentCat) {
        uniqueSlug = `${parentCat.slug}-${baseSlug}`;
      }
    }

    this.slug = uniqueSlug;
  }
  next();
});


module.exports = mongoose.model('Category', categorySchema);
