// backend/routes/productRoutes.js
import express from 'express';
import Product from '../models/product.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// @desc    Get all products (Search bhi isme kaam karega)
// @route   GET /api/products?q=keyword&cat=category
router.get('/', async (req, res) => {
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

    const products = await Product.find(filter);
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Get single product by ID
// @route   GET /api/products/:id
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Create a product
// @route   POST /api/products
router.post('/', protect, admin, async (req, res) => {
  try {
    const { name, price, image, description, category, stock } = req.body;
    const product = new Product({ name, price, image, description, category, stock });
    const createdProduct = await product.save();
    res.status(201).json(createdProduct);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Update a product
// @route   PUT /api/products/:id
router.put('/:id', protect, admin, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    
    product.name = req.body.name || product.name;
    product.price = req.body.price || product.price;
    product.image = req.body.image || product.image;
    product.description = req.body.description || product.description;
    product.category = req.body.category || product.category;
    product.stock = req.body.stock || product.stock;

    const updatedProduct = await product.save();
    res.status(200).json(updatedProduct);
  } catch (error) {
    res.status(500).json({ message: error.message });
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