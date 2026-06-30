// backend/models/Product.js
import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  oldPrice: { type: Number, default: null },
  image: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true },
  stock: { type: Number, required: true, default: 10 },
  rating: { type: Number, default: 4 },
  ratingNum: { type: Number, default: 7.5 },
  orders: { type: Number, default: 0 },
}, {
  timestamps: true
});

const Product = mongoose.model('Product', productSchema);
export default Product;