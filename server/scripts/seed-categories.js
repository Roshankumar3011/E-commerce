const mongoose = require('mongoose');
require('dotenv').config();
const Category = require('../models/Category');

const seedCategories = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing to avoid confusion with the new hierarchy
    await Category.deleteMany({});
    console.log('🗑️  Cleared old categories');

    // 1. Parent Categories
    const men = await Category.create({ name: 'Men', description: 'Men\'s Collection' });
    const women = await Category.create({ name: 'Women', description: 'Women\'s Collection' });
    const kids = await Category.create({ name: 'Kids', description: 'Kids\' Collection' });

    // 2. Men's Subcategories
    await Category.create({ name: 'Shirts', parent: men._id, description: 'Men\'s Shirts' });
    await Category.create({ name: 'T-Shirts', parent: men._id, description: 'Men\'s T-Shirts' });
    await Category.create({ name: 'Coats', parent: men._id, description: 'Men\'s Coats' });
    
    const menEthnic = await Category.create({ name: 'Ethnic', parent: men._id, description: 'Men\'s Ethnic Wear' });
    await Category.create({ name: 'Kurta', parent: menEthnic._id, description: 'Men\'s Kurta' });

    const menFormals = await Category.create({ name: 'Formals', parent: men._id, description: 'Men\'s Formal Wear' });
    await Category.create({ name: 'Coat Pant', parent: menFormals._id, description: 'Men\'s Formal Sets' });

    // 3. Women's Subcategories
    await Category.create({ name: 'Shirt', parent: women._id, description: 'Women\'s Shirts' });
    await Category.create({ name: 'T-Shirt', parent: women._id, description: 'Women\'s T-Shirts' });
    await Category.create({ name: 'Pant', parent: women._id, description: 'Women\'s Pants' });
    await Category.create({ name: 'Jeans', parent: women._id, description: 'Women\'s Jeans' });
    
    const womenEthnic = await Category.create({ name: 'Ethnic', parent: women._id, description: 'Women\'s Ethnic Wear' });
    await Category.create({ name: 'Kurti', parent: womenEthnic._id, description: 'Women\'s Kurti' });
    await Category.create({ name: 'Saree', parent: womenEthnic._id, description: 'Women\'s Saree' });
    await Category.create({ name: 'Lehenga', parent: womenEthnic._id, description: 'Women\'s Lehenga' });

    console.log('✅ Successfully seeded detailed hierarchical categories!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error seeding categories:', err);
    process.exit(1);
  }
};


seedCategories();
