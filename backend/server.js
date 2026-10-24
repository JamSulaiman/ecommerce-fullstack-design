// backend/server.js
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import mongoose from 'mongoose';
import { fileURLToPath } from 'node:url';
import connectDB from './config/db.js';
import productRoutes from './routes/productRoutes.js';
import userRoutes from './routes/userRoutes.js';
import Order from './models/Order.js';
import Product from './models/product.js';

dotenv.config({ path: fileURLToPath(new URL('./.env', import.meta.url)) });

const app = express();
app.use(cors({
  origin: [
    'https://ecommerce-fullstack-design-ayxy.vercel.app',
    'https://ecommerce-fullstack-design-olive-one.vercel.app',
    'http://localhost:5173',
    'http://localhost:3000',
    'http://127.0.0.1:5173',
    'http://127.0.0.1:3000',
  ],
  credentials: true,
  exposedHeaders: ['X-Server-Time'],
}));
app.use(express.json());

app.use('/api/products', productRoutes);
app.use('/api/users', userRoutes);

app.get('/', (req, res) => {
  res.send('🚀 Server chal raha hai with APIs!');
});

app.get('/health', (req, res) => {
  const databaseReady = mongoose.connection.readyState === 1;
  res.status(databaseReady ? 200 : 503).json({
    status: databaseReady ? 'ok' : 'unavailable',
    database: databaseReady ? 'connected' : 'disconnected',
  });
});

const PORT = process.env.PORT || 5000;
await connectDB();
await Order.createIndexes();
const saleStartsAt = new Date();
await Product.updateMany(
  {
    oldPrice: { $ne: null },
    saleEndsAt: null,
    $expr: { $gt: ['$oldPrice', '$price'] },
  },
  {
    $set: {
      saleStartsAt,
      saleEndsAt: new Date(saleStartsAt.getTime() + 48 * 60 * 60 * 1000),
    },
  }
);
const legacyTerminalOrders = await Order.find({
  status: { $in: ['delivered', 'cancelled'] },
  terminalAt: null,
}).select('status statusHistory updatedAt createdAt').lean();
if (legacyTerminalOrders.length) {
  await Order.bulkWrite(legacyTerminalOrders.map((order) => {
    const terminalHistory = [...(order.statusHistory || [])]
      .reverse()
      .find((entry) => entry.status === order.status);
    return {
      updateOne: {
        filter: { _id: order._id, terminalAt: null },
        update: { $set: { terminalAt: terminalHistory?.date || order.updatedAt || order.createdAt || new Date() } },
      },
    };
  }));
}
app.listen(PORT, () => {
  console.log(`✅ Server is running on http://localhost:${PORT}`);
});
