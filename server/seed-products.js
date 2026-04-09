const mongoose = require('mongoose');
require('dotenv').config();

const Category = require('./models/Category');
const Product = require('./models/Product');

const seedProducts = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing products and categories only
    await Product.deleteMany({});
    await Category.deleteMany({});
    console.log('🗑️  Cleared existing products & categories');

    // Drop the slug index to avoid stale index issues, then recreate
    try {
      await mongoose.connection.collection('categories').dropIndexes();
    } catch (e) {
      // Ignore if no indexes exist
    }

    // Create categories one-by-one so pre-save hook generates slugs
    const categoryData = [
      { name: 'T-Shirts', description: 'Casual and stylish t-shirts' },
      { name: 'Shirts', description: 'Formal and casual shirts' },
      { name: 'Jeans', description: 'Denim jeans for all' },
      { name: 'Dresses', description: 'Beautiful dresses for women' },
      { name: 'Kurtas', description: 'Traditional Indian kurtas' },
      { name: 'Kids Wear', description: 'Clothing for children' },
      { name: 'Activewear', description: 'Sports and gym wear' },
      { name: 'Ethnic Wear', description: 'Traditional ethnic clothing' },
      { name: 'Trousers', description: 'Formal and casual trousers' },
      { name: 'Jackets', description: 'Warm and trendy jackets' },
    ];
    const categories = [];
    for (const cat of categoryData) {
      const created = await Category.create(cat);
      categories.push(created);
    }
    console.log('✅ Categories created');

    const catMap = {};
    categories.forEach((c) => (catMap[c.name] = c._id));

    // ===================== 15 PRODUCTS =====================
    const products = [
      // ─── MEN (5 Products) ───
      {
        name: 'Classic Cotton Crew Neck T-Shirt',
        description: 'Premium cotton crew neck t-shirt with a comfortable relaxed fit. Perfect for casual everyday wear. Made from 100% organic cotton with a soft hand feel.',
        price: 499,
        originalPrice: 999,
        category: catMap['T-Shirts'],
        gender: 'Men',
        brand: 'Roadster',
        images: [
          'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400',
          'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=400',
        ],
        sizes: [
          { size: 'S', stock: 25 },
          { size: 'M', stock: 50 },
          { size: 'L', stock: 40 },
          { size: 'XL', stock: 30 },
        ],
        colors: [
          { name: 'White', hexCode: '#FFFFFF' },
          { name: 'Black', hexCode: '#000000' },
          { name: 'Navy', hexCode: '#1a237e' },
        ],
        material: '100% Cotton',
        ratings: { average: 4.3, count: 156 },
        tags: ['cotton', 'casual', 'basic'],
      },
      {
        name: 'Formal Oxford Button-Down Shirt',
        description: 'Premium oxford button-down shirt perfect for office and formal occasions. Wrinkle-resistant fabric for all-day comfort and sharp looks.',
        price: 1299,
        originalPrice: 2499,
        category: catMap['Shirts'],
        gender: 'Men',
        brand: 'Van Heusen',
        images: [
          'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=400',
          'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400',
        ],
        sizes: [
          { size: 'S', stock: 20 },
          { size: 'M', stock: 35 },
          { size: 'L', stock: 28 },
          { size: 'XL', stock: 15 },
        ],
        colors: [
          { name: 'White', hexCode: '#FFFFFF' },
          { name: 'Sky Blue', hexCode: '#4fc3f7' },
          { name: 'Pink', hexCode: '#f48fb1' },
        ],
        material: 'Cotton Oxford',
        ratings: { average: 4.5, count: 234 },
        tags: ['formal', 'office', 'oxford'],
      },
      {
        name: 'Slim Fit Stretch Denim Jeans',
        description: 'Modern slim fit jeans with stretch technology for maximum comfort and movement. Classic 5-pocket design with clean finishing.',
        price: 1499,
        originalPrice: 2999,
        category: catMap['Jeans'],
        gender: 'Men',
        brand: 'Levis',
        images: [
          'https://images.unsplash.com/photo-1542272604-787c3835535d?w=400',
          'https://images.unsplash.com/photo-1604176354204-9268737828e4?w=400',
        ],
        sizes: [
          { size: 'S', stock: 18 },
          { size: 'M', stock: 40 },
          { size: 'L', stock: 35 },
          { size: 'XL', stock: 20 },
        ],
        colors: [
          { name: 'Dark Blue', hexCode: '#1565c0' },
          { name: 'Black', hexCode: '#212121' },
          { name: 'Light Blue', hexCode: '#64b5f6' },
        ],
        material: 'Denim with Elastane',
        ratings: { average: 4.4, count: 312 },
        tags: ['denim', 'slim-fit', 'stretch'],
      },
      {
        name: 'Premium Leather Biker Jacket',
        description: 'Classic biker-style leather jacket with zippered pockets and snap collar. Premium faux leather construction for a bold statement look.',
        price: 3499,
        originalPrice: 6999,
        category: catMap['Jackets'],
        gender: 'Men',
        brand: 'Wrogn',
        images: [
          'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400',
          'https://images.unsplash.com/photo-1520975954732-35dd22299614?w=400',
        ],
        sizes: [
          { size: 'M', stock: 12 },
          { size: 'L', stock: 18 },
          { size: 'XL', stock: 10 },
        ],
        colors: [
          { name: 'Black', hexCode: '#212121' },
          { name: 'Brown', hexCode: '#795548' },
        ],
        material: 'Faux Leather',
        ratings: { average: 4.3, count: 67 },
        tags: ['leather', 'biker', 'winter'],
      },
      {
        name: 'Cotton Kurta Pajama Set',
        description: 'Traditional cotton kurta with matching pajama. Comfortable and breathable for daily wear and festive occasions.',
        price: 899,
        originalPrice: 1799,
        category: catMap['Kurtas'],
        gender: 'Men',
        brand: 'Manyavar',
        images: [
          'https://images.unsplash.com/photo-1574180045827-681f8a1a9622?w=400',
          'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=400',
        ],
        sizes: [
          { size: 'S', stock: 20 },
          { size: 'M', stock: 35 },
          { size: 'L', stock: 30 },
          { size: 'XL', stock: 15 },
          { size: 'XXL', stock: 8 },
        ],
        colors: [
          { name: 'White', hexCode: '#FAFAFA' },
          { name: 'Cream', hexCode: '#FFF8E1' },
          { name: 'Light Blue', hexCode: '#B3E5FC' },
        ],
        material: 'Cotton',
        ratings: { average: 4.4, count: 189 },
        tags: ['kurta', 'traditional', 'cotton'],
      },

      // ─── WOMEN (5 Products) ───
      {
        name: 'Floral Print Maxi Dress',
        description: 'Elegant floral print maxi dress with flowy silhouette. Perfect for brunches, parties, and special occasions. Lightweight and comfortable.',
        price: 1899,
        originalPrice: 3499,
        category: catMap['Dresses'],
        gender: 'Women',
        brand: 'ONLY',
        images: [
          'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=400',
          'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400',
        ],
        sizes: [
          { size: 'XS', stock: 12 },
          { size: 'S', stock: 25 },
          { size: 'M', stock: 30 },
          { size: 'L', stock: 15 },
        ],
        colors: [
          { name: 'Floral Blue', hexCode: '#42a5f5' },
          { name: 'Floral Pink', hexCode: '#ec407a' },
        ],
        material: 'Georgette',
        ratings: { average: 4.6, count: 178 },
        tags: ['floral', 'maxi', 'party'],
      },
      {
        name: 'Women Striped Casual Shirt',
        description: 'Comfortable striped casual shirt for women. Regular fit with roll-up sleeves for a chic, relaxed weekend look.',
        price: 799,
        originalPrice: 1599,
        category: catMap['Shirts'],
        gender: 'Women',
        brand: 'Sassafras',
        images: [
          'https://images.unsplash.com/photo-1564257631407-4deb1f99d992?w=400',
          'https://images.unsplash.com/photo-1598554747436-c9293d6a588f?w=400',
        ],
        sizes: [
          { size: 'XS', stock: 15 },
          { size: 'S', stock: 28 },
          { size: 'M', stock: 35 },
          { size: 'L', stock: 20 },
        ],
        colors: [
          { name: 'Blue Stripe', hexCode: '#1976d2' },
          { name: 'Pink Stripe', hexCode: '#e91e63' },
        ],
        material: 'Cotton',
        ratings: { average: 4.2, count: 95 },
        tags: ['striped', 'casual', 'regular-fit'],
      },
      {
        name: 'Embroidered Anarkali Kurta Set',
        description: 'Beautiful embroidered Anarkali kurta set with dupatta. Perfect for festivals, celebrations, and wedding functions.',
        price: 2499,
        originalPrice: 4999,
        category: catMap['Ethnic Wear'],
        gender: 'Women',
        brand: 'Biba',
        images: [
          'https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=400',
          'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=400',
        ],
        sizes: [
          { size: 'S', stock: 10 },
          { size: 'M', stock: 20 },
          { size: 'L', stock: 15 },
          { size: 'XL', stock: 8 },
        ],
        colors: [
          { name: 'Red', hexCode: '#e53935' },
          { name: 'Teal', hexCode: '#009688' },
          { name: 'Maroon', hexCode: '#6d1b1b' },
        ],
        material: 'Rayon',
        ratings: { average: 4.7, count: 256 },
        tags: ['ethnic', 'anarkali', 'festival', 'embroidered'],
      },
      {
        name: 'Women High-Waist Yoga Leggings',
        description: 'High-waisted yoga leggings with 4-way stretch. Squat-proof and moisture-wicking fabric for ultimate performance.',
        price: 999,
        originalPrice: 1999,
        category: catMap['Activewear'],
        gender: 'Women',
        brand: 'Puma',
        images: [
          'https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=400',
          'https://images.unsplash.com/photo-1594381898411-846e7d193883?w=400',
        ],
        sizes: [
          { size: 'XS', stock: 10 },
          { size: 'S', stock: 25 },
          { size: 'M', stock: 30 },
          { size: 'L', stock: 20 },
        ],
        colors: [
          { name: 'Black', hexCode: '#212121' },
          { name: 'Purple', hexCode: '#7b1fa2' },
        ],
        material: 'Nylon Spandex',
        ratings: { average: 4.5, count: 167 },
        tags: ['yoga', 'gym', 'leggings'],
      },
      {
        name: 'Printed Chiffon Saree',
        description: 'Elegant printed chiffon saree with unstitched blouse piece. Lightweight and drapes beautifully for any occasion.',
        price: 1799,
        originalPrice: 3599,
        category: catMap['Ethnic Wear'],
        gender: 'Women',
        brand: 'Saree Mall',
        images: [
          'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=400',
          'https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=400',
        ],
        sizes: [{ size: 'Free Size', stock: 30 }],
        colors: [
          { name: 'Blue', hexCode: '#1565c0' },
          { name: 'Pink', hexCode: '#e91e63' },
          { name: 'Green', hexCode: '#388e3c' },
        ],
        material: 'Chiffon',
        ratings: { average: 4.4, count: 98 },
        tags: ['saree', 'chiffon', 'printed', 'ethnic'],
      },

      // ─── KIDS (5 Products) ───
      {
        name: 'Kids Cartoon Print T-Shirt',
        description: 'Fun cartoon character printed t-shirt for kids. Made from soft 100% cotton that is gentle on sensitive skin.',
        price: 399,
        originalPrice: 799,
        category: catMap['Kids Wear'],
        gender: 'Kids',
        brand: 'YK Disney',
        images: [
          'https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?w=400',
          'https://images.unsplash.com/photo-1543269865-cbf427effbad?w=400',
        ],
        sizes: [
          { size: 'S', stock: 30 },
          { size: 'M', stock: 40 },
          { size: 'L', stock: 25 },
        ],
        colors: [
          { name: 'Yellow', hexCode: '#FDD835' },
          { name: 'Red', hexCode: '#E53935' },
          { name: 'Blue', hexCode: '#1E88E5' },
        ],
        material: '100% Cotton',
        ratings: { average: 4.5, count: 142 },
        tags: ['kids', 'cartoon', 'fun'],
      },
      {
        name: 'Kids Denim Dungaree',
        description: 'Adorable denim dungaree for kids with adjustable straps and multiple pockets. Durable and stylish for everyday play.',
        price: 699,
        originalPrice: 1399,
        category: catMap['Kids Wear'],
        gender: 'Kids',
        brand: 'H&M',
        images: [
          'https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?w=400',
          'https://images.unsplash.com/photo-1471286174890-9c112ffca5b4?w=400',
        ],
        sizes: [
          { size: 'S', stock: 15 },
          { size: 'M', stock: 20 },
          { size: 'L', stock: 12 },
        ],
        colors: [{ name: 'Blue Denim', hexCode: '#1565C0' }],
        material: 'Denim',
        ratings: { average: 4.2, count: 56 },
        tags: ['kids', 'denim', 'dungaree'],
      },
      {
        name: 'Kids Rainbow Hoodie Sweatshirt',
        description: 'Cozy fleece-lined hoodie with vibrant rainbow print. Kangaroo pocket and adjustable hood for warmth and fun.',
        price: 599,
        originalPrice: 1199,
        category: catMap['Kids Wear'],
        gender: 'Kids',
        brand: 'Max Kids',
        images: [
          'https://images.unsplash.com/photo-1503944583220-79d8926ad5e2?w=400',
          'https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?w=400',
        ],
        sizes: [
          { size: 'S', stock: 22 },
          { size: 'M', stock: 28 },
          { size: 'L', stock: 18 },
        ],
        colors: [
          { name: 'Multicolor', hexCode: '#FF5722' },
          { name: 'Grey', hexCode: '#9E9E9E' },
        ],
        material: 'Cotton Fleece',
        ratings: { average: 4.6, count: 88 },
        tags: ['kids', 'hoodie', 'winter', 'rainbow'],
      },
      {
        name: 'Kids Cotton Jogger Pants',
        description: 'Comfortable cotton jogger pants for active kids. Elastic waist with drawstring and ribbed cuffs for a snug fit.',
        price: 449,
        originalPrice: 899,
        category: catMap['Kids Wear'],
        gender: 'Kids',
        brand: 'United Colors of Benetton',
        images: [
          'https://images.unsplash.com/photo-1471286174890-9c112ffca5b4?w=400',
          'https://images.unsplash.com/photo-1503944583220-79d8926ad5e2?w=400',
        ],
        sizes: [
          { size: 'S', stock: 25 },
          { size: 'M', stock: 35 },
          { size: 'L', stock: 20 },
        ],
        colors: [
          { name: 'Navy', hexCode: '#1a237e' },
          { name: 'Grey', hexCode: '#616161' },
          { name: 'Black', hexCode: '#212121' },
        ],
        material: 'Cotton Blend',
        ratings: { average: 4.3, count: 73 },
        tags: ['kids', 'joggers', 'casual', 'comfortable'],
      },
      {
        name: 'Kids Floral Frock Dress',
        description: 'Beautiful floral printed frock dress for girls. Flared skirt with bow detail at waist. Perfect for parties and outings.',
        price: 549,
        originalPrice: 1099,
        category: catMap['Kids Wear'],
        gender: 'Kids',
        brand: 'Mothercare',
        images: [
          'https://images.unsplash.com/photo-1543269865-cbf427effbad?w=400',
          'https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?w=400',
        ],
        sizes: [
          { size: 'S', stock: 18 },
          { size: 'M', stock: 25 },
          { size: 'L', stock: 15 },
        ],
        colors: [
          { name: 'Pink Floral', hexCode: '#F06292' },
          { name: 'Yellow Floral', hexCode: '#FFD54F' },
        ],
        material: 'Cotton',
        ratings: { average: 4.7, count: 64 },
        tags: ['kids', 'frock', 'floral', 'party'],
      },
    ];

    // Use create() one by one so the pre-save hook runs (calculates totalStock & discount)
    for (const p of products) {
      await Product.create(p);
    }
    console.log(`✅ ${products.length} products seeded successfully!`);

    console.log('\n🎉 Seed complete!');
    console.log('\nProduct breakdown:');
    console.log('  👔 Men:   5 products');
    console.log('  👗 Women: 5 products');
    console.log('  👶 Kids:  5 products');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seed error:', error);
    process.exit(1);
  }
};

seedProducts();
