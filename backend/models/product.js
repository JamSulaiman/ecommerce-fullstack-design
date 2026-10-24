// backend/models/Product.js
import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
  name: { type: String, required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, trim: true, maxlength: 1000, default: '' },
}, { timestamps: true });

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true, min: 0.01 },
  oldPrice: {
    type: Number,
    default: null,
    min: 0.01,
    validate: {
      validator(value) {
        return value == null || value > this.price;
      },
      message: 'Regular price must be higher than the sale price.',
    },
  },
  saleStartsAt: { type: Date, default: null },
  saleEndsAt: { type: Date, default: null },
  image: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true },
  brand: { type: String, trim: true, default: '' },
  stock: {
    type: Number,
    required: true,
    default: 0,
    min: 0,
    validate: { validator: Number.isInteger, message: 'Stock must be a whole number.' },
  },
  rating: { type: Number, default: 0, min: 0, max: 5 },
  ratingCount: { type: Number, default: 0, min: 0 },
  reviews: { type: [reviewSchema], default: [] },
  orders: { type: Number, default: 0 },
}, {
  timestamps: true
});

const Product = mongoose.model('Product', productSchema);
export default Product;