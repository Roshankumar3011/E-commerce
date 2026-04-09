const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('./models/User');
const Category = require('./models/Category');
const Product = require('./models/Product');

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Category.deleteMany({});
    await Product.deleteMany({});

    // Create admin user
    const admin = await User.create({
      name: 'Admin',
      email: 'admin@flipkart.com',
      password: 'admin123',
      role: 'admin',
      phone: '9999999999',
    });
    console.log('✅ Admin created: admin@flipkart.com / admin123');

    // Create test user
    const user = await User.create({
      name: 'John Doe',
      email: 'john@example.com',
      password: 'user123',
      role: 'user',
      phone: '9876543210',
      addresses: [{
        fullName: 'John Doe',
        phone: '9876543210',
        addressLine1: '123 Main Street',
        addressLine2: 'Apt 4B',
        city: 'Mumbai',
        state: 'Maharashtra',
        pincode: '400001',
        isDefault: true,
      }],
    });
    console.log('✅ Test user created: john@example.com / user123');

    // Create categories
    const categories = await Category.insertMany([
      { name: 'T-Shirts', description: 'Casual and stylish t-shirts' },
      { name: 'Shirts', description: 'Formal and casual shirts' },
      { name: 'Jeans', description: 'Denim jeans for all' },
      { name: 'Dresses', description: 'Beautiful dresses for women' },
      { name: 'Jackets', description: 'Warm and trendy jackets' },
      { name: 'Kurtas', description: 'Traditional Indian kurtas' },
      { name: 'Trousers', description: 'Formal and casual trousers' },
      { name: 'Activewear', description: 'Sports and gym wear' },
      { name: 'Kids Wear', description: 'Clothing for children' },
      { name: 'Ethnic Wear', description: 'Traditional ethnic clothing' },
    ]);
    console.log('✅ Categories created');

    const catMap = {};
    categories.forEach((c) => (catMap[c.name] = c._id));

    // Create products
    const products = [
      {
        name: 'Classic Cotton Crew Neck T-Shirt',
        description: 'Premium cotton crew neck t-shirt with a comfortable relaxed fit. Perfect for casual everyday wear. Made from 100% organic cotton with a soft hand feel.',
        price: 499,
        originalPrice: 999,
        category: catMap['T-Shirts'],
        gender: 'Men',
        brand: 'Roadster',
        images: ['https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400', 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=400'],
        sizes: [{ size: 'S', stock: 25 }, { size: 'M', stock: 50 }, { size: 'L', stock: 40 }, { size: 'XL', stock: 30 }],
        colors: [{ name: 'White', hexCode: '#FFFFFF' }, { name: 'Black', hexCode: '#000000' }, { name: 'Navy', hexCode: '#1a237e' }],
        material: '100% Cotton',
        ratings: { average: 4.3, count: 156 },
        tags: ['cotton', 'casual', 'basic'],
      },
      {
        name: 'Slim Fit Printed T-Shirt',
        description: 'Trendy printed t-shirt with unique graphic design. Slim fit silhouette that flatters your body shape.',
        price: 599,
        originalPrice: 1199,
        category: catMap['T-Shirts'],
        gender: 'Men',
        brand: 'HRX by Hrithik Roshan',
        images: ['https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=400', 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=400'],
        sizes: [{ size: 'S', stock: 15 }, { size: 'M', stock: 30 }, { size: 'L', stock: 25 }, { size: 'XL', stock: 10 }],
        colors: [{ name: 'Blue', hexCode: '#1565c0' }, { name: 'Red', hexCode: '#c62828' }],
        material: 'Cotton Blend',
        ratings: { average: 4.1, count: 89 },
        tags: ['printed', 'slim-fit', 'graphic'],
      },
      {
        name: 'Formal Oxford Button-Down Shirt',
        description: 'Premium oxford button-down shirt perfect for office and formal occasions. Wrinkle-resistant fabric for all-day comfort.',
        price: 1299,
        originalPrice: 2499,
        category: catMap['Shirts'],
        gender: 'Men',
        brand: 'Van Heusen',
        images: ['https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=400', 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400'],
        sizes: [{ size: 'S', stock: 20 }, { size: 'M', stock: 35 }, { size: 'L', stock: 28 }, { size: 'XL', stock: 15 }],
        colors: [{ name: 'White', hexCode: '#FFFFFF' }, { name: 'Sky Blue', hexCode: '#4fc3f7' }, { name: 'Pink', hexCode: '#f48fb1' }],
        material: 'Cotton Oxford',
        ratings: { average: 4.5, count: 234 },
        tags: ['formal', 'office', 'oxford'],
      },
      {
        name: 'Slim Fit Stretch Jeans',
        description: 'Modern slim fit jeans with stretch technology for maximum comfort and movement. Classic 5-pocket design.',
        price: 1499,
        originalPrice: 2999,
        category: catMap['Jeans'],
        gender: 'Men',
        brand: 'Levis',
        images: ['https://images.unsplash.com/photo-1542272604-787c3835535d?w=400', 'https://images.unsplash.com/photo-1604176354204-9268737828e4?w=400'],
        sizes: [{ size: 'S', stock: 18 }, { size: 'M', stock: 40 }, { size: 'L', stock: 35 }, { size: 'XL', stock: 20 }],
        colors: [{ name: 'Dark Blue', hexCode: '#1565c0' }, { name: 'Black', hexCode: '#212121' }, { name: 'Light Blue', hexCode: '#64b5f6' }],
        material: 'Denim with Elastane',
        ratings: { average: 4.4, count: 312 },
        tags: ['denim', 'slim-fit', 'stretch'],
      },
      {
        name: 'Floral Print Maxi Dress',
        description: 'Elegant floral print maxi dress with flowy silhouette. Perfect for brunches, parties, and special occasions.',
        price: 1899,
        originalPrice: 3499,
        category: catMap['Dresses'],
        gender: 'Women',
        brand: 'ONLY',
        images: ['https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=400', 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400'],
        sizes: [{ size: 'XS', stock: 12 }, { size: 'S', stock: 25 }, { size: 'M', stock: 30 }, { size: 'L', stock: 15 }],
        colors: [{ name: 'Floral Blue', hexCode: '#42a5f5' }, { name: 'Floral Pink', hexCode: '#ec407a' }],
        material: 'Georgette',
        ratings: { average: 4.6, count: 178 },
        tags: ['floral', 'maxi', 'party'],
      },
      {
        name: 'Women Striped Casual Shirt',
        description: 'Comfortable striped casual shirt for women. Regular fit with roll-up sleeves for a relaxed look.',
        price: 799,
        originalPrice: 1599,
        category: catMap['Shirts'],
        gender: 'Women',
        brand: 'Sassafras',
        images: ['https://images.unsplash.com/photo-1564257631407-4deb1f99d992?w=400', 'https://images.unsplash.com/photo-1598554747436-c9293d6a588f?w=400'],
        sizes: [{ size: 'XS', stock: 15 }, { size: 'S', stock: 28 }, { size: 'M', stock: 35 }, { size: 'L', stock: 20 }],
        colors: [{ name: 'Blue Stripe', hexCode: '#1976d2' }, { name: 'Pink Stripe', hexCode: '#e91e63' }],
        material: 'Cotton',
        ratings: { average: 4.2, count: 95 },
        tags: ['striped', 'casual', 'regular-fit'],
      },
      {
        name: 'Embroidered Anarkali Kurta Set',
        description: 'Beautiful embroidered Anarkali kurta set with dupatta. Perfect for festivals and celebrations.',
        price: 2499,
        originalPrice: 4999,
        category: catMap['Ethnic Wear'],
        gender: 'Women',
        brand: 'Biba',
        images: ['https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=400', 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=400'],
        sizes: [{ size: 'S', stock: 10 }, { size: 'M', stock: 20 }, { size: 'L', stock: 15 }, { size: 'XL', stock: 8 }],
        colors: [{ name: 'Red', hexCode: '#e53935' }, { name: 'Teal', hexCode: '#009688' }, { name: 'Maroon', hexCode: '#6d1b1b' }],
        material: 'Rayon',
        ratings: { average: 4.7, count: 256 },
        tags: ['ethnic', 'anarkali', 'festival', 'embroidered'],
      },
      {
        name: 'Premium Leather Biker Jacket',
        description: 'Classic biker-style leather jacket with zippered pockets and snap collar. Premium faux leather construction.',
        price: 3499,
        originalPrice: 6999,
        category: catMap['Jackets'],
        gender: 'Men',
        brand: 'Wrogn',
        images: ['https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400', 'https://images.unsplash.com/photo-1520975954732-35dd22299614?w=400'],
        sizes: [{ size: 'M', stock: 12 }, { size: 'L', stock: 18 }, { size: 'XL', stock: 10 }],
        colors: [{ name: 'Black', hexCode: '#212121' }, { name: 'Brown', hexCode: '#795548' }],
        material: 'Faux Leather',
        ratings: { average: 4.3, count: 67 },
        tags: ['leather', 'biker', 'winter'],
      },
      {
        name: 'Cotton Kurta Pajama Set',
        description: 'Traditional cotton kurta with matching pajama. Comfortable and breathable for daily wear.',
        price: 899,
        originalPrice: 1799,
        category: catMap['Kurtas'],
        gender: 'Men',
        brand: 'Manyavar',
        images: ['https://images.unsplash.com/photo-1574180045827-681f8a1a9622?w=400', 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=400'],
        sizes: [{ size: 'S', stock: 20 }, { size: 'M', stock: 35 }, { size: 'L', stock: 30 }, { size: 'XL', stock: 15 }, { size: 'XXL', stock: 8 }],
        colors: [{ name: 'White', hexCode: '#FAFAFA' }, { name: 'Cream', hexCode: '#FFF8E1' }, { name: 'Light Blue', hexCode: '#B3E5FC' }],
        material: 'Cotton',
        ratings: { average: 4.4, count: 189 },
        tags: ['kurta', 'traditional', 'cotton'],
      },
      {
        name: 'Kids Cartoon Print T-Shirt',
        description: 'Fun cartoon character printed t-shirt for kids. Made from soft cotton for sensitive skin.',
        price: 399,
        originalPrice: 799,
        category: catMap['Kids Wear'],
        gender: 'Kids',
        brand: 'YK Disney',
        images: ['https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?w=400', 'https://images.unsplash.com/photo-1543269865-cbf427effbad?w=400'],
        sizes: [{ size: 'S', stock: 30 }, { size: 'M', stock: 40 }, { size: 'L', stock: 25 }],
        colors: [{ name: 'Yellow', hexCode: '#FDD835' }, { name: 'Red', hexCode: '#E53935' }, { name: 'Blue', hexCode: '#1E88E5' }],
        material: '100% Cotton',
        ratings: { average: 4.5, count: 142 },
        tags: ['kids', 'cartoon', 'fun'],
      },
      {
        name: 'Kids Denim Dungaree',
        description: 'Adorable denim dungaree for kids with adjustable straps and multiple pockets.',
        price: 699,
        originalPrice: 1399,
        category: catMap['Kids Wear'],
        gender: 'Kids',
        brand: 'H&M',
        images: ['https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?w=400', 'https://images.unsplash.com/photo-1471286174890-9c112ffca5b4?w=400'],
        sizes: [{ size: 'S', stock: 5 }, { size: 'M', stock: 3 }, { size: 'L', stock: 2 }],
        colors: [{ name: 'Blue Denim', hexCode: '#1565C0' }],
        material: 'Denim',
        ratings: { average: 4.2, count: 56 },
        tags: ['kids', 'denim', 'dungaree'],
      },
      {
        name: 'Dry-Fit Running T-Shirt',
        description: 'Moisture-wicking dry-fit t-shirt designed for running and high-intensity workouts.',
        price: 699,
        originalPrice: 1499,
        category: catMap['Activewear'],
        gender: 'Men',
        brand: 'Nike',
        images: ['https://images.unsplash.com/photo-1556906781-9a412961c28c?w=400', 'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=400'],
        sizes: [{ size: 'S', stock: 20 }, { size: 'M', stock: 35 }, { size: 'L', stock: 25 }, { size: 'XL', stock: 15 }],
        colors: [{ name: 'Black', hexCode: '#212121' }, { name: 'Neon Green', hexCode: '#76ff03' }],
        material: 'Polyester Dry-Fit',
        ratings: { average: 4.6, count: 203 },
        tags: ['sports', 'running', 'dry-fit'],
      },
      {
        name: 'Women Yoga Leggings',
        description: 'High-waisted yoga leggings with 4-way stretch. Squat-proof and moisture-wicking fabric.',
        price: 999,
        originalPrice: 1999,
        category: catMap['Activewear'],
        gender: 'Women',
        brand: 'Puma',
        images: ['https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=400', 'https://images.unsplash.com/photo-1594381898411-846e7d193883?w=400'],
        sizes: [{ size: 'XS', stock: 10 }, { size: 'S', stock: 25 }, { size: 'M', stock: 30 }, { size: 'L', stock: 20 }],
        colors: [{ name: 'Black', hexCode: '#212121' }, { name: 'Purple', hexCode: '#7b1fa2' }],
        material: 'Nylon Spandex',
        ratings: { average: 4.5, count: 167 },
        tags: ['yoga', 'gym', 'leggings'],
      },
      {
        name: 'Formal Pleated Trousers',
        description: 'Classic formal trousers with pleated front. Perfect for office wear with wrinkle-free fabric.',
        price: 1199,
        originalPrice: 2199,
        category: catMap['Trousers'],
        gender: 'Men',
        brand: 'Peter England',
        images: ['https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=400', 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=400'],
        sizes: [{ size: 'M', stock: 25 }, { size: 'L', stock: 30 }, { size: 'XL', stock: 20 }, { size: 'XXL', stock: 10 }],
        colors: [{ name: 'Navy', hexCode: '#1a237e' }, { name: 'Grey', hexCode: '#616161' }, { name: 'Black', hexCode: '#212121' }],
        material: 'Polyester Blend',
        ratings: { average: 4.3, count: 145 },
        tags: ['formal', 'office', 'pleated'],
      },
      {
        name: 'Printed Chiffon Saree',
        description: 'Elegant printed chiffon saree with unstitched blouse piece. Lightweight and drapes beautifully.',
        price: 1799,
        originalPrice: 3599,
        category: catMap['Ethnic Wear'],
        gender: 'Women',
        brand: 'Saree Mall',
        images: ['https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=400', 'https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=400'],
        sizes: [{ size: 'Free Size', stock: 30 }],
        colors: [{ name: 'Blue', hexCode: '#1565c0' }, { name: 'Pink', hexCode: '#e91e63' }, { name: 'Green', hexCode: '#388e3c' }],
        material: 'Chiffon',
        ratings: { average: 4.4, count: 98 },
        tags: ['saree', 'chiffon', 'printed', 'ethnic'],
      },
      {
        name: 'Oversized Hoodie',
        description: 'Ultra-soft fleece-lined oversized hoodie. Perfect for layering in cold weather or lounging at home.',
        price: 1299,
        originalPrice: 2599,
        category: catMap['Jackets'],
        gender: 'Unisex',
        brand: 'Bewakoof',
        images: ['https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400', 'https://images.unsplash.com/photo-1578768079470-62f67e15cd4c?w=400'],
        sizes: [{ size: 'M', stock: 20 }, { size: 'L', stock: 30 }, { size: 'XL', stock: 25 }, { size: 'XXL', stock: 15 }],
        colors: [{ name: 'Charcoal', hexCode: '#37474f' }, { name: 'Olive', hexCode: '#558b2f' }, { name: 'Mustard', hexCode: '#f9a825' }],
        material: 'Cotton Fleece',
        ratings: { average: 4.5, count: 234 },
        tags: ['hoodie', 'oversized', 'winter', 'unisex'],
      },
    ];

    await Product.insertMany(products);
    console.log(`✅ ${products.length} products created`);

    console.log('\n🎉 Seed complete!');
    console.log('\nLogin Credentials:');
    console.log('Admin: admin@flipkart.com / admin123');
    console.log('User:  john@example.com / user123');

    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
};

seedData();
