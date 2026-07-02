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

// Seed endpoint - products ko database mein add karne ke liye
app.get('/api/seed', async (req, res) => {
  try {
    const Product = (await import('./models/product.js')).default;
    
    const existingCount = await Product.countDocuments();
    if (existingCount > 0) {
      return res.json({ message: 'Products already exist', count: existingCount });
    }

    const products = [
      { name: 'Canon Camera EOS 2000, Black 10x zoom', price: 998.0, oldPrice: 1128.0, image: '/products/tech/6.jpg', description: 'Professional camera with 10x zoom', category: 'Computer and tech', stock: 25, rating: 4, ratingNum: 7.5, orders: 154 },
      { name: 'GoPro HERO6 4K Action Camera - Black', price: 998.0, oldPrice: null, image: '/products/tech/3.jpg', description: 'Action camera for outdoor', category: 'Computer and tech', stock: 18, rating: 4, ratingNum: 7.5, orders: 154 },
      { name: 'Smartwatch Series Modern', price: 99.5, oldPrice: 128.0, image: '/products/tech/8.jpg', description: 'Smartwatch with health tracking', category: 'Computer and tech', stock: 30, rating: 4, ratingNum: 7.5, orders: 154 },
      { name: 'Premium Laptop Slim', price: 1299.0, oldPrice: 1528.0, image: '/products/tech/7.jpg', description: 'High performance slim laptop', category: 'Computer and tech', stock: 12, rating: 4, ratingNum: 7.5, orders: 154 },
      { name: 'Wireless Headphones White', price: 99.5, oldPrice: 128.0, image: '/products/tech/9.jpg', description: 'Premium noise-cancelling headphones', category: 'Computer and tech', stock: 22, rating: 4, ratingNum: 7.5, orders: 154 },
      { name: 'Modern Sofa Set', price: 1200.0, oldPrice: 1500.0, image: '/products/interior/5.jpg', description: 'Contemporary sofa for living room', category: 'Home interiors', stock: 12, rating: 5, ratingNum: 11.0, orders: 34 },
      { name: 'Decorative Plant Pot', price: 34.0, oldPrice: 42.0, image: '/products/interior/3.jpg', description: 'Stylish plant pot', category: 'Home interiors', stock: 56, rating: 4, ratingNum: 6.8, orders: 76 },
      { name: 'Table Lamp with USB Port', price: 22.5, oldPrice: 29.0, image: '/products/interior/6.jpg', description: 'Bedside lamp with USB charger', category: 'Home interiors', stock: 35, rating: 4, ratingNum: 7.3, orders: 64 },
      { name: 'Portable Camping Tent', price: 99.0, oldPrice: 129.0, image: '/products/interior/8.jpg', description: 'Lightweight outdoor tent', category: 'Sports and outdoor', stock: 22, rating: 4, ratingNum: 8.1, orders: 48 },
      { name: 'Outdoor Sports Shoes', price: 58.0, oldPrice: 75.0, image: '/products/tech/4.jpg', description: 'Durable running shoes', category: 'Sports and outdoor', stock: 30, rating: 4, ratingNum: 8.5, orders: 92 },
      { name: 'Premium Winter Jacket', price: 75.0, oldPrice: 99.0, image: '/products/cloth/5.jpg', description: 'Warm and stylish jacket', category: 'Clothes and wear', stock: 26, rating: 4, ratingNum: 9.0, orders: 120 },
      { name: 'Classic Designer Dress', price: 85.0, oldPrice: 110.0, image: '/products/cloth/6.jpg', description: 'Elegant formal dress', category: 'Clothes and wear', stock: 18, rating: 4, ratingNum: 8.8, orders: 96 },
    ];

    await Product.insertMany(products);
    res.json({ message: `✅ ${products.length} products added!`, count: products.length });
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