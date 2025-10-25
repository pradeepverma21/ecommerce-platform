const mongoose = require('mongoose');
const User = require('../models/User');
const Category = require('../models/Category');
const Product = require('../models/Product');
require('dotenv').config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

const seedData = async () => {
  try {
    // Clear existing data
    await User.deleteMany();
    await Category.deleteMany();
    await Product.deleteMany();
    console.log('Cleared existing data');

    // Create admin user
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@ecommerce.com',
      password: 'admin123',
      role: 'admin'
    });
    console.log('Admin user created');

    // Create regular user
    const user = await User.create({
      name: 'Test User',
      email: 'user@ecommerce.com',
      password: 'user123',
      role: 'user'
    });
    console.log('Regular user created');

    // Create categories
    const categories = await Category.create([
      {
        name: 'Electronics',
        description: 'Electronic devices and gadgets',
        image: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400'
      },
      {
        name: 'Clothing',
        description: 'Fashion and apparel',
        image: 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=400'
      },
      {
        name: 'Books',
        description: 'Books and literature',
        image: 'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=400'
      },
      {
        name: 'Home & Kitchen',
        description: 'Home decor and kitchen appliances',
        image: 'https://images.unsplash.com/photo-1556911220-bff31c812dba?w=400'
      },
      {
        name: 'Sports',
        description: 'Sports equipment and fitness gear',
        image: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=400'
      }
    ]);
    console.log('Categories created');

    // Create products
    const products = await Product.create([
      // Electronics
      {
        name: 'Wireless Headphones',
        description: 'Premium noise-cancelling wireless headphones with 30-hour battery life. Crystal clear sound quality with deep bass.',
        price: 2999,
        discountPrice: 2499,
        category: categories[0]._id,
        images: [
          'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500',
          'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=500'
        ],
        brand: 'AudioPro',
        stock: 50,
        isFeatured: true,
        tags: ['wireless', 'headphones', 'audio'],
        specifications: {
          'Battery Life': '30 hours',
          'Connectivity': 'Bluetooth 5.0',
          'Weight': '250g'
        }
      },
      {
        name: 'Smart Watch',
        description: 'Fitness tracking smart watch with heart rate monitor, GPS, and water resistance.',
        price: 4999,
        discountPrice: 3999,
        category: categories[0]._id,
        images: [
          'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500'
        ],
        brand: 'TechFit',
        stock: 30,
        isFeatured: true,
        tags: ['smartwatch', 'fitness', 'wearable']
      },
      {
        name: 'Laptop Stand',
        description: 'Ergonomic aluminum laptop stand with adjustable height and angle.',
        price: 1499,
        category: categories[0]._id,
        images: [
          'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=500'
        ],
        brand: 'WorkDesk',
        stock: 100,
        tags: ['laptop', 'accessories', 'ergonomic']
      },
      
      // Clothing
      {
        name: 'Cotton T-Shirt',
        description: 'Comfortable premium cotton t-shirt available in multiple colors. Perfect for everyday wear.',
        price: 599,
        discountPrice: 399,
        category: categories[1]._id,
        images: [
          'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500'
        ],
        brand: 'FashionHub',
        stock: 200,
        isFeatured: true,
        tags: ['tshirt', 'cotton', 'casual']
      },
      {
        name: 'Denim Jacket',
        description: 'Classic blue denim jacket with a modern fit. Durable and stylish.',
        price: 2499,
        discountPrice: 1999,
        category: categories[1]._id,
        images: [
          'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=500'
        ],
        brand: 'DenimCo',
        stock: 75,
        tags: ['jacket', 'denim', 'casual']
      },
      
      // Books
      {
        name: 'The Complete JavaScript Guide',
        description: 'Comprehensive guide to modern JavaScript programming. From basics to advanced concepts.',
        price: 899,
        category: categories[2]._id,
        images: [
          'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=500'
        ],
        brand: 'TechBooks',
        stock: 150,
        isFeatured: true,
        tags: ['programming', 'javascript', 'education']
      },
      {
        name: 'Fiction Best Seller',
        description: 'Award-winning fiction novel that captivates readers from start to finish.',
        price: 499,
        category: categories[2]._id,
        images: [
          'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=500'
        ],
        brand: 'NovelPress',
        stock: 200,
        tags: ['fiction', 'bestseller', 'novel']
      },
      
      // Home & Kitchen
      {
        name: 'Coffee Maker',
        description: 'Automatic coffee maker with timer and keep-warm function. Makes perfect coffee every time.',
        price: 3499,
        discountPrice: 2999,
        category: categories[3]._id,
        images: [
          'https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=500'
        ],
        brand: 'BrewMaster',
        stock: 40,
        isFeatured: true,
        tags: ['coffee', 'kitchen', 'appliance']
      },
      {
        name: 'Dining Table Set',
        description: 'Modern 4-seater dining table set with comfortable chairs. Made from solid wood.',
        price: 15999,
        discountPrice: 12999,
        category: categories[3]._id,
        images: [
          'https://images.unsplash.com/photo-1617806118233-18e1de247200?w=500'
        ],
        brand: 'HomeStyle',
        stock: 15,
        tags: ['furniture', 'dining', 'home']
      },
      
      // Sports
      {
        name: 'Yoga Mat',
        description: 'Extra thick yoga mat with carrying strap. Non-slip surface for all yoga styles.',
        price: 1299,
        discountPrice: 999,
        category: categories[4]._id,
        images: [
          'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=500'
        ],
        brand: 'YogaPro',
        stock: 80,
        isFeatured: true,
        tags: ['yoga', 'fitness', 'exercise']
      },
      {
        name: 'Dumbbell Set',
        description: 'Adjustable dumbbell set from 5kg to 25kg. Perfect for home workouts.',
        price: 4999,
        category: categories[4]._id,
        images: [
          'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=500'
        ],
        brand: 'FitGear',
        stock: 25,
        tags: ['weights', 'fitness', 'strength']
      }
    ]);
    console.log('Products created');

    console.log('\nDatabase seeded successfully!');
    console.log('\nSummary:');
    console.log(`- Users: ${await User.countDocuments()}`);
    console.log(`- Categories: ${await Category.countDocuments()}`);
    console.log(`- Products: ${await Product.countDocuments()}`);
    console.log('\n👤 Login Credentials:');
    console.log('Admin: admin@ecommerce.com / admin123');
    console.log('User: user@ecommerce.com / user123');

  } catch (error) {
    console.error('Error seeding data:', error);
  }
};

const run = async () => {
  await connectDB();
  await seedData();
  process.exit();
};

run();