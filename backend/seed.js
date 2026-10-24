import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from './models/product.js';
import connectDB from './config/db.js';

dotenv.config();

const legacySeedNames = [
  'Canon Camera EOS 2000, Black 10x zoom',
  'GoPro HERO6 4K Action Camera - Black',
  'Smartwatch Series Modern',
  'Premium Laptop Slim',
  'Tablet Pro Max',
  'Smartphone Red Edition',
  'Smartphone Blue Edition',
  'Smartphone Dark Edition',
  'Wireless Headphones White',
  'Luxury Car Seat Cover Set',
  'Premium Winter Jacket',
  'Classic Designer Dress',
  'Modern Sofa Set',
  'Decorative Plant Pot',
  'Table Lamp with USB Port',
  'Portable Camping Tent',
  'Outdoor Sports Shoes',
  'Dog Carrier Bag',
  'Automatic Pet Feeder',
  'Cordless Electric Drill',
  'Professional Wrench Set',
  'Industrial Gearbox Kit',
  'Hydraulic Floor Jack',
];

const removeLegacySeedProducts = async () => {
  try {
    await connectDB();

    // Older seed runs assigned fake order totals and ratings; admin-created products did not.
    const legacySeedFilter = {
      name: { $in: legacySeedNames },
      orders: { $gt: 0 },
      ratingNum: { $exists: true },
    };
    const { deletedCount = 0 } = await Product.collection.deleteMany(legacySeedFilter);
    const remainingCount = await Product.collection.countDocuments();
    console.log(`Removed ${deletedCount} legacy seeded products; ${remainingCount} products remain.`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
};

removeLegacySeedProducts();
