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

// Get all products with filtering, sorting, pagination (Fuzzy Search Enabled)
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
      tags,
      season,
      isFeatured,
      isPinnedTopDeals,
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
    if (tags) query.tags = { $in: tags.split(',') };
    if (season) query.season = { $in: season.split(',') };
    if (isFeatured === 'true') query.isFeatured = true;
    if (isPinnedTopDeals === 'true') query.isPinnedTopDeals = true;
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    // Standard high-performance MongoDB query for non-search results
    let products = await Product.find(query)
      .populate('category', 'name slug')
      .sort(sort);

    let total = products.length;

    // Apply Fuzzy Search if search query exists
    if (search) {
      const Fuse = require('fuse.js');
      const fuse = new Fuse(products, {
        keys: [
          { name: 'name', weight: 2 },
          { name: 'brand', weight: 1.5 },
          { name: 'tags', weight: 1 },
          { name: 'description', weight: 0.5 }
        ],
        threshold: 0.4, // Typo tolerance
        includeScore: true
      });

      const fuseResults = fuse.search(search);
      products = fuseResults.map(r => r.item);
      total = products.length;
    }

    // Manual Pagination (necessary for Fuse results)
    const startIndex = (Number(page) - 1) * Number(limit);
    const paginatedProducts = products.slice(startIndex, startIndex + Number(limit));

    res.json({
      success: true,
      products: paginatedProducts,
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

// GET Search Suggestions (Fuzzy Autocomplete)
router.get('/search/suggestions', async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) return res.json({ success: true, suggestions: [] });

    const products = await Product.find({ isActive: true })
      .select('name brand category tags')
      .populate('category', 'name')
      .limit(200); // Sample for speed

    const Fuse = require('fuse.js');
    const fuse = new Fuse(products, {
      keys: ['name', 'brand', 'tags', 'category.name'],
      threshold: 0.35,
    });

    const results = fuse.search(q).slice(0, 8);
    const suggestions = results.map(r => ({
      id: r.item._id,
      text: r.item.name,
      brand: r.item.brand,
      category: r.item.category?.name
    }));

    res.json({ success: true, suggestions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get categories list by gender
router.get('/meta/categories', async (req, res) => {
  try {
    const { gender } = req.query;
    const filter = { isActive: true };
    if (gender) filter.gender = gender;
    
    // Find all products matching the filter (gender) and get their distinct category IDs
    const categoryIds = await Product.distinct('category', filter);
    
    // Fetch the category objects for these IDs
    const Category = require('../models/Category');
    const categories = await Category.find({ _id: { $in: categoryIds }, isActive: true }).populate('parent', 'name slug');
    
    res.json({ success: true, categories });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get unique seasons used by pinned products
router.get('/meta/seasons', async (req, res) => {
  try {
    const seasons = await Product.distinct('season', { isActive: true, isPinnedTopDeals: true });
    res.json({ success: true, seasons: seasons.filter(Boolean) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get brands list
router.get('/meta/brands', async (req, res) => {
  try {
    const { gender } = req.query;
    const filter = { isActive: true };
    if (gender) filter.gender = gender;
    
    const brands = await Product.distinct('brand', filter);
    res.json({ success: true, brands });
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
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    // Update fields
    Object.assign(product, req.body);
    
    // Save document (triggers pre-save hooks)
    await product.save();

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

module.exports = router;
