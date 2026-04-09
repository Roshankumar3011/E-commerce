require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

const seedUsers = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing demo users to avoid conflicts
    await User.deleteOne({ email: 'john@example.com' });
    await User.deleteOne({ email: 'admin@flipkart.com' });

    // Create Demo User
    const user = await User.create({
      name: 'John Doe',
      email: 'john@example.com',
      password: 'user123',
      phone: '9876543210',
      role: 'user',
    });

    // Create Demo Admin
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@flipkart.com',
      password: 'admin123',
      phone: '9999988888',
      role: 'admin',
    });

    console.log('✅ Demo users seeded successfully:');
    console.log('- User: john@example.com / user123');
    console.log('- Admin: admin@flipkart.com / admin123');

    process.exit();
  } catch (error) {
    console.error('❌ Error seeding users:', error.message);
    process.exit(1);
  }
};

seedUsers();
