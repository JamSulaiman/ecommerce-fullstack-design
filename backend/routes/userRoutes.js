import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Order from '../models/Order.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// @desc    Register user
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: 'User already exists' });
    const user = await User.create({ name, email, password });
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '30d' });
    res.status(201).json({ _id: user._id, name, email, isAdmin: user.isAdmin, token });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Get user order history
// @route   GET /api/users/orders
// @access  Private
router.get('/orders', protect, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).populate('orderItems.product', 'name image price');
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Get all customer orders (admin only)
// @route   GET /api/users/admin/orders
// @access  Private/Admin
router.get('/admin/orders', protect, admin, async (req, res) => {
  try {
    const orders = await Order.find().populate('user', 'name email isAdmin').populate('orderItems.product', 'name image price');
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Get all customers (admin only)
// @route   GET /api/users/admin/customers
// @access  Private/Admin
router.get('/admin/customers', protect, admin, async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Create a new order
// @route   POST /api/users/orders
// @access  Private
router.post('/orders', protect, async (req, res) => {
  try {
    const { orderItems, totalPrice } = req.body;

    if (!orderItems || orderItems.length === 0) {
      return res.status(400).json({ message: 'No order items' });
    }

    const order = new Order({
      user: req.user._id,
      orderItems,
      totalPrice,
    });

    const createdOrder = await order.save();
    res.status(201).json(createdOrder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Login user
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (user && (await user.matchPassword(password))) {
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '30d' });
      res.json({ _id: user._id, name: user.name, email, isAdmin: user.isAdmin, token });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;