// backend/server.js
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db.js';
import productRoutes from './routes/productRoutes.js';
import userRoutes from './routes/userRoutes.js';

dotenv.config();
connectDB();

const app = express();
app.use(cors({
    origin: [
        'https://ecommerce-fullstack-design-ayxy.vercel.app',
        'https://ecommerce-fullstack-design-olive-one.vercel.app',
        'http://localhost:5173',
        'http://localhost:3000'
    ],
    credentials: true
}));
app.use(express.json());


// Yahan humne products ki routes add ki hain
app.use('/api/products', productRoutes);
app.use('/api/users', userRoutes);

// Seed endpoint - products ko database mein add karne ke liye (27 products ka complete catalog)
// Pehle se jo products hain woh delete kar deta hai
app.get('/api/seed', async (req, res) => {
  try {
    const Product = (await import('./models/product.js')).default;
    
    // Delete existing products
    await Product.deleteMany();
    console.log('Deleted old products');

    const products = [
      { name: 'Canon Camera EOS 2000, Black 10x zoom', price: 998.0, oldPrice: 1128.0, image: '/products/cloth/1.jpg', description: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.', category: 'Electronics', stock: 25, rating: 4, ratingNum: 7.5, orders: 154 },
      { name: 'GoPro HERO6 4K Action Camera - Black', price: 998.0, oldPrice: null, image: '/products/tech/3.jpg', description: 'Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.', category: 'Electronics', stock: 18, rating: 4, ratingNum: 7.5, orders: 154 },
      { name: 'GoPro HERO6 4K Action Camera - Black', price: 998.0, oldPrice: null, image: '/products/tech/2.jpg', description: 'Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.', category: 'Electronics', stock: 18, rating: 4, ratingNum: 7.5, orders: 154 },
      { name: 'GoPro HERO6 4K Action Camera - Black', price: 998.0, oldPrice: null, image: '/products/tech/7.jpg', description: 'Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.', category: 'Electronics', stock: 18, rating: 4, ratingNum: 7.5, orders: 154 },
      { name: 'GoPro HERO6 4K Action Camera - Black', price: 998.0, oldPrice: 1128.0, image: '/products/tech/8.jpg', description: 'Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.', category: 'Electronics', stock: 18, rating: 4, ratingNum: 7.5, orders: 154 },
      { name: 'GoPro HERO6 4K Action Camera - Black', price: 998.0, oldPrice: null, image: '/products/tech/9.jpg', description: 'Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.', category: 'Electronics', stock: 18, rating: 4, ratingNum: 7.5, orders: 154 },
      { name: 'Smartwatch Series Modern', price: 99.5, oldPrice: 1128.0, image: '/products/tech/8.jpg', description: 'Stylish smartwatch with health tracking and long battery life.', category: 'Electronics', stock: 30, rating: 4, ratingNum: 7.5, orders: 154 },
      { name: 'Premium Laptop Slim', price: 99.5, oldPrice: 1128.0, image: '/products/tech/7.jpg', description: 'High performance slim laptop for work and play.', category: 'Electronics', stock: 12, rating: 4, ratingNum: 7.5, orders: 154 },
      { name: 'Tablet Pro Max', price: 99.5, oldPrice: 1128.0, image: '/products/tech/2.jpg', description: 'Large display tablet with crisp resolution.', category: 'Electronics', stock: 14, rating: 4, ratingNum: 7.5, orders: 154 },
      { name: 'Smartphone Red Edition', price: 99.5, oldPrice: 1128.0, image: '/products/tech/1.jpg', description: 'Latest smartphone with dual camera setup.', category: 'Electronics', stock: 20, rating: 4, ratingNum: 7.5, orders: 154 },
      { name: 'Smartphone Blue Edition', price: 99.5, oldPrice: 1128.0, image: '/products/tech/4.jpg', description: 'Latest smartphone with dual camera setup.', category: 'Electronics', stock: 20, rating: 3, ratingNum: 5.9, orders: 154 },
      { name: 'Smartphone Dark Edition', price: 99.5, oldPrice: null, image: '/products/tech/3.jpg', description: 'Latest smartphone with vibrant gradient finish.', category: 'Electronics', stock: 20, rating: 4, ratingNum: 7.5, orders: 154 },
      { name: 'Wireless Headphones White', price: 99.5, oldPrice: 1128.0, image: '/products/tech/9.jpg', description: 'Premium noise-cancelling wireless headphones.', category: 'Electronics', stock: 22, rating: 4, ratingNum: 7.5, orders: 154 },
      { name: 'Luxury Car Seat Cover Set', price: 49.99, oldPrice: 59.99, image: '/products/cloth/4.jpg', description: 'Comfortable leather seat covers for automobiles.', category: 'Automobiles', stock: 40, rating: 4, ratingNum: 8.2, orders: 187 },
      { name: 'Premium Winter Jacket', price: 75.0, oldPrice: 99.0, image: '/products/cloth/5.jpg', description: 'Warm and stylish jacket for winter wear.', category: 'Clothes and wear', stock: 26, rating: 4, ratingNum: 9.0, orders: 120 },
      { name: 'Classic Designer Dress', price: 85.0, oldPrice: 110.0, image: '/products/cloth/6.jpg', description: 'Elegant formal dress for special occasions.', category: 'Clothes and wear', stock: 18, rating: 4, ratingNum: 8.8, orders: 96 },
      { name: 'Modern Sofa Set', price: 1200.0, oldPrice: null, image: '/products/interior/5.jpg', description: 'Contemporary sofa set for your living room.', category: 'Home interiors', stock: 12, rating: 5, ratingNum: 11.0, orders: 34 },
      { name: 'Decorative Plant Pot', price: 34.0, oldPrice: 42.0, image: '/products/interior/3.jpg', description: 'Stylish plant pot for home decoration.', category: 'Home interiors', stock: 56, rating: 4, ratingNum: 6.8, orders: 76 },
      { name: 'Table Lamp with USB Port', price: 22.5, oldPrice: 29.0, image: '/products/interior/6.jpg', description: 'Bedside lamp with an integrated USB charger.', category: 'Home interiors', stock: 35, rating: 4, ratingNum: 7.3, orders: 64 },
      { name: 'Portable Camping Tent', price: 99.0, oldPrice: 129.0, image: '/products/interior/8.jpg', description: 'Lightweight outdoor tent for camping trips.', category: 'Sports and outdoor', stock: 22, rating: 4, ratingNum: 8.1, orders: 48 },
      { name: 'Outdoor Sports Shoes', price: 58.0, oldPrice: 75.0, image: '/products/tech/4.jpg', description: 'Durable running shoes for outdoor training.', category: 'Sports and outdoor', stock: 30, rating: 4, ratingNum: 8.5, orders: 92 },
      { name: 'Dog Carrier Bag', price: 45.0, oldPrice: 59.0, image: '/products/cloth/2.jpg', description: 'Portable pet carrier bag for small dogs.', category: 'Animal and pets', stock: 27, rating: 4, ratingNum: 7.0, orders: 38 },
      { name: 'Automatic Pet Feeder', price: 65.0, oldPrice: 79.0, image: '/products/cloth/7.jpg', description: 'Self-feeding device for busy pet owners.', category: 'Animal and pets', stock: 19, rating: 4, ratingNum: 7.6, orders: 54 },
      { name: 'Cordless Electric Drill', price: 74.0, oldPrice: 88.0, image: '/products/tech/1.jpg', description: 'Powerful drill for home and workshop use.', category: 'Tools, equipments', stock: 33, rating: 4, ratingNum: 8.9, orders: 65 },
      { name: 'Professional Wrench Set', price: 39.9, oldPrice: 49.9, image: '/products/tech/2.jpg', description: 'Versatile wrench set for mechanics and hobbyists.', category: 'Tools, equipments', stock: 50, rating: 4, ratingNum: 8.0, orders: 71 },
      { name: 'Industrial Gearbox Kit', price: 299.0, oldPrice: 349.0, image: '/products/tech/7.jpg', description: 'High-strength gearbox kit for machinery repairs.', category: 'Machinery tools', stock: 13, rating: 4, ratingNum: 8.4, orders: 22 },
      { name: 'Hydraulic Floor Jack', price: 219.0, oldPrice: 259.0, image: '/products/tech/5.jpg', description: 'Heavy-duty hydraulic jack for lifting vehicles.', category: 'Machinery tools', stock: 10, rating: 4, ratingNum: 8.7, orders: 28 },
    ];

    await Product.insertMany(products);
    res.json({ message: `✅ ${products.length} products added!`, count: products.length });
  } catch (error) {
    res.status(500).json({ message: `❌ Error: ${error.message}` });
  }
});

// Create admin user endpoint
app.get('/api/create-admin', async (req, res) => {
  try {
    const User = (await import('./models/User.js')).default;
    
    const adminExists = await User.findOne({ email: 'admin@test.com' });
    if (adminExists) {
      return res.json({ message: 'Admin already exists' });
    }

    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@test.com',
      password: '123456',
      isAdmin: true,
    });

    res.json({ message: '✅ Admin user created!', email: 'admin@test.com', password: '123456' });
  } catch (error) {
    res.status(500).json({ message: `❌ Error: ${error.message}` });
  }
});

app.get('/', (req, res) => {
  res.send('🚀 Server chal raha hai with APIs!');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server is running on http://localhost:${PORT}`);
});