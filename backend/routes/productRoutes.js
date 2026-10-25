// backend/routes/productRoutes.js
import express from 'express';
import Product from '../models/product.js';
import Order from '../models/Order.js';
import { protect, optionalProtect, admin } from '../middleware/authMiddleware.js';
import { serializeProductPricing } from '../utils/productPricing.js';

const router = express.Router();
const MAX_SALE_DURATION_HOURS = 24 * 30;

const serializeProductForViewer = (product, user, now) => {
  const serialized = serializeProductPricing(product, now);
  if (!user?.isAdmin) serialized.stock = serialized.stock > 0 ? 1 : 0;
  return serialized;
};

const getSaleSchedule = (oldPrice, price, durationHours) => {
  if (oldPrice == null) return { saleStartsAt: null, saleEndsAt: null };
  const hours = Number(durationHours);
  if (!Number.isInteger(hours) || hours < 1 || hours > MAX_SALE_DURATION_HOURS) {
    throw Object.assign(new Error(`Sale duration must be between 1 and ${MAX_SALE_DURATION_HOURS} hours.`), { status: 400 });
  }
  if (Number(oldPrice) <= Number(price)) {
    throw Object.assign(new Error('Regular price must be higher than the sale price.'), { status: 400 });
  }
  const saleStartsAt = new Date();
  return { saleStartsAt, saleEndsAt: new Date(saleStartsAt.getTime() + hours * 60 * 60 * 1000) };
};

// @desc    Get all products (Search bhi isme kaam karega)
// @route   GET /api/products?q=keyword&cat=category
router.get('/', optionalProtect, async (req, res) => {
  try {
    const search = req.query.q || req.query.search || '';
    const category = req.query.cat || '';
    const filter = {};
    const clauses = [];

    if (search) {
      const terms = search.split(/\s+/).filter(Boolean);
      const orClauses = terms.flatMap((term) => [
        { name: { $regex: term, $options: 'i' } },
        { description: { $regex: term, $options: 'i' } },
        { category: { $regex: term, $options: 'i' } },
      ]);
      clauses.push({ $or: orClauses });
    }

    if (category) {
      clauses.push({ category: { $regex: category, $options: 'i' } });
    }

    if (clauses.length === 1) {
      Object.assign(filter, clauses[0]);
    } else if (clauses.length > 1) {
      filter.$and = clauses;
    }

    const products = await Product.find(filter).select('-reviews.user');
    const now = new Date();
    res.set('X-Server-Time', String(now.getTime()));
    res.status(200).json(products.map((product) => serializeProductForViewer(product, req.user, now)));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Get single product by ID
// @route   GET /api/products/:id
router.get('/:id', optionalProtect, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).select('-reviews.user');
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.status(200).json(serializeProductForViewer(product, req.user, new Date()));
  } catch (error) {
    res.status(error.name === 'CastError' ? 400 : 500).json({ message: error.message });
  }
});

router.get('/:id/reviews', optionalProtect, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).select('reviews');
    if (!product) return res.status(404).json({ message: 'Product not found' });
    const myReview = req.user
      ? product.reviews.find((review) => review.user.equals(req.user._id))
      : null;
    const canReview = Boolean(req.user && !req.user.isAdmin && await Order.exists({
      user: req.user._id,
      status: 'delivered',
      'orderItems.product': product._id,
    }));
    res.json({
      reviews: product.reviews.map(({ name, rating, comment, createdAt }) => ({ name, rating, comment, createdAt })),
      canReview,
      myReview: myReview ? { rating: myReview.rating, comment: myReview.comment } : null,
    });
  } catch (error) {
    res.status(error.name === 'CastError' ? 400 : 500).json({ message: error.message });
  }
});

router.post('/:id/reviews', protect, async (req, res) => {
  try {
    if (req.user.isAdmin) {
      return res.status(403).json({ message: 'Admin accounts cannot submit customer reviews.' });
    }
    const rating = Number(req.body.rating);
    if (req.body.comment !== undefined && typeof req.body.comment !== 'string') {
      return res.status(400).json({ message: 'Review comment must be text.' });
    }
    const comment = typeof req.body.comment === 'string' ? req.body.comment.trim() : '';
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be a whole number from 1 to 5.' });
    }
    if (comment.length > 1000) {
      return res.status(400).json({ message: 'Review must be 1000 characters or fewer.' });
    }

    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    const deliveredOrder = await Order.exists({
      user: req.user._id,
      status: 'delivered',
      'orderItems.product': product._id,
    });
    if (!deliveredOrder) {
      return res.status(403).json({ message: 'You can review a product after your order is delivered.' });
    }

    const existingReview = product.reviews.find((review) => review.user.equals(req.user._id));
    if (existingReview) {
      existingReview.rating = rating;
      existingReview.comment = comment;
    } else {
      product.reviews.push({ user: req.user._id, name: req.user.name, rating, comment });
    }
    product.ratingCount = product.reviews.length;
    product.rating = product.reviews.reduce((total, review) => total + review.rating, 0) / product.ratingCount;
    await product.save();
    res.status(200).json({ rating: product.rating, ratingCount: product.ratingCount });
  } catch (error) {
    res.status(error.name === 'CastError' ? 400 : 500).json({ message: error.message });
  }
});

// @desc    Create a product
// @route   POST /api/products
router.post('/', protect, admin, async (req, res) => {
  try {
    const {
      name,
      price,
      oldPrice = null,
      saleDurationHours,
      image,
      description,
      category,
      brand = '',
      stock,
    } = req.body;
    const saleSchedule = getSaleSchedule(oldPrice, price, saleDurationHours);
    const product = new Product({
      name,
      price,
      oldPrice,
      ...saleSchedule,
      image,
      description,
      category,
      brand,
      stock,
      rating: 0,
      ratingCount: 0,
      orders: 0,
    });
    const createdProduct = await product.save();
    res.status(201).json(serializeProductPricing(createdProduct));
  } catch (error) {
    res.status(error.status || (error.name === 'CastError' || error.name === 'ValidationError' ? 400 : 500)).json({ message: error.message });
  }
});

// @desc    Update a product
// @route   PUT /api/products/:id
router.put('/:id', protect, admin, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    
    for (const field of ['name', 'price', 'oldPrice', 'image', 'description', 'category', 'brand', 'stock']) {
      if (req.body[field] !== undefined) product[field] = req.body[field];
    }
    if (req.body.oldPrice !== undefined) {
      const saleSchedule = getSaleSchedule(product.oldPrice, product.price, req.body.saleDurationHours);
      product.saleStartsAt = saleSchedule.saleStartsAt;
      product.saleEndsAt = saleSchedule.saleEndsAt;
    }

    const updatedProduct = await product.save();
    res.status(200).json(serializeProductPricing(updatedProduct));
  } catch (error) {
    res.status(error.status || (error.name === 'CastError' || error.name === 'ValidationError' ? 400 : 500)).json({ message: error.message });
  }
});

// @desc    Delete a product
// @route   DELETE /api/products/:id
router.delete('/:id', protect, admin, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    await product.deleteOne();
    res.status(200).json({ message: 'Product removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;