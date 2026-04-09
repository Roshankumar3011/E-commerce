const mongoose = require('mongoose');
const Category = require('../models/Category');
const Product = require('../models/Product');
require('dotenv').config();

const verifyFilter = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to DB');

  // Find categories
  const men = await Category.findOne({ name: 'Men' });
  const shirts = await Category.findOne({ name: 'Shirts' });
  const kurta = await Category.findOne({ name: 'Kurta' });

  if (!men || !shirts || !kurta) {
    console.log('Categories not found. Please run seed-categories.js first.');
    process.exit(1);
  }

  // Create products
  await Product.deleteMany({ brand: 'TEST_FILTER' });
  
  await Product.create([
    { name: 'Root Men Shirt', brand: 'TEST_FILTER', price: 100, category: men._id, gender: 'Men', images: ['https://via.placeholder.com/400'], description: 'Root' },
    { name: 'Child Men Shirt', brand: 'TEST_FILTER', price: 200, category: shirts._id, gender: 'Men', images: ['https://via.placeholder.com/400'], description: 'Child' },
    { name: 'Grandchild Men Kurta', brand: 'TEST_FILTER', price: 300, category: kurta._id, gender: 'Men', images: ['https://via.placeholder.com/400'], description: 'Grandchild' }
  ]);

  console.log('Created 3 products in hierarchical categories.');
  process.exit(0);
};

verifyFilter();
