// backend/config/db.js
import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    const uri = process.env.MONGO_URI;
    if (!uri) {
      throw new Error('MONGO_URI is not set. Create backend/.env from backend/.env.example and add your MongoDB connection URI.');
    }
    if (/<(?:username|password|cluster-host)>|cluster-host/i.test(uri)) {
      throw new Error('MONGO_URI still contains example placeholders. Replace them with your MongoDB Atlas connection details from Atlas > Connect > Drivers.');
    }

    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000, // 5 seconds baad timeout ho jaye agar internet ka masla ho
      family: 4                       // Force IPv4 (Hotspot connectivity issues ko fix karne ke liye)
    });
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;