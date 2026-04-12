const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const Product = require('../models/Product');

dotenv.config({ path: path.join(__dirname, '../.env') });

const updateTags = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const products = await Product.find({ isActive: true });
    console.log(`Found ${products.length} products. Updating tags...`);

    const seasonalTags = ['Summer', 'Winter', 'Rainy'];
    const menClothingTags = ['T-shirts', 'Pants', 'Coats'];
    const womenClothingTags = ['Dresses', 'Tops', 'Skirts'];
    const kidsClothingTags = ['Clothing', 'Toys', 'Accessories'];

    for (let i = 0; i < products.length; i++) {
        const product = products[i];
        const tagsToSync = [];
        
        // Seasonal tags
        tagsToSync.push(seasonalTags[i % seasonalTags.length]);
        
        // Category tags based on gender if available
        if (product.gender === 'Men') {
            tagsToSync.push(menClothingTags[Math.floor(Math.random() * menClothingTags.length)]);
        } else if (product.gender === 'Women') {
            tagsToSync.push(womenClothingTags[Math.floor(Math.random() * womenClothingTags.length)]);
        } else if (product.gender === 'Kids') {
            tagsToSync.push(kidsClothingTags[Math.floor(Math.random() * kidsClothingTags.length)]);
        } else {
            // General variety for products without gender
            tagsToSync.push(menClothingTags[0]);
            tagsToSync.push(womenClothingTags[0]);
        }

        // Special logic for Men section if needed, but random is fine for seed data
        const currentTags = product.tags || [];
        let updated = false;

        tagsToSync.forEach(tag => {
            if (!currentTags.includes(tag)) {
                currentTags.push(tag);
                updated = true;
            }
        });

        if (updated) {
            product.tags = currentTags;
            await product.save();
        }
    }

    console.log('✅ Tags updated successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error updating tags:', error.message);
    process.exit(1);
  }
};

updateTags();
