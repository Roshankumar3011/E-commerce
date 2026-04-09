const router = require('express').Router();
const Product = require('../models/Product');
const { protect, admin } = require('../middleware/auth');

// Helper to get all child category IDs recursively
const getChildCategoryIds = async (parentId) => {
  const Category = require('../models/Category');
  let childIds = [parentId];
  const children = await Category.find({ parent: parentId, isActive: true });
  
  if (children.length > 0) {
    const tasks = children.map(child => getChildCategoryIds(child._id));
    const nestedIds = await Promise.all(tasks);
    nestedIds.forEach(ids => {
      childIds = childIds.concat(ids);
    });
  }
  return childIds;
};

// Get all products with filtering, sorting, pagination
router.get('/', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 12,
      sort = '-createdAt',
      gender,
      category,
      brand,
      minPrice,
      maxPrice,
      search,
      size,
      color,
      rating,
    } = req.query;

    const query = { isActive: true };

    if (gender) query.gender = gender;
    
    if (category) {
      const allCategoryIds = await getChildCategoryIds(category);
      query.category = { $in: allCategoryIds };
    }

    if (brand) query.brand = { $in: brand.split(',') };
    if (size) query['sizes.size'] = { $in: size.split(',') };
    if (color) query['colors.name'] = { $in: color.split(',') };
    if (rating) query['ratings.average'] = { $gte: Number(rating) };
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }
    if (search) {
      query.$text = { $search: search };
    }

    const total = await Product.countDocuments(query);
    const products = await Product.find(query)
      .populate('category', 'name slug')
      .sort(sort)
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));

    res.json({
      success: true,
      products,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get single product
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate('category', 'name slug');
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    res.json({ success: true, product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Create product (admin)
router.post('/', protect, admin, async (req, res) => {
  try {
    const product = await Product.create(req.body);
    res.status(201).json({ success: true, product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update product (admin)
router.put('/:id', protect, admin, async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    res.json({ success: true, product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Delete product (admin)
router.delete('/:id', protect, admin, async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    res.json({ success: true, message: 'Product deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get featured / top-rated products
router.get('/featured/top', async (req, res) => {
  try {
    const products = await Product.find({ isActive: true })
      .sort('-ratings.average')
      .limit(8)
      .populate('category', 'name slug');
    res.json({ success: true, products });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get brands list
router.get('/meta/brands', async (req, res) => {
  try {
    const brands = await Product.distinct('brand', { isActive: true });
    res.json({ success: true, brands });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
