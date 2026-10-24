import express from 'express';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import { createHash, randomInt, timingSafeEqual } from 'node:crypto';
import User from '../models/User.js';
import Order from '../models/Order.js';
import Inquiry from '../models/Inquiry.js';
import Product from '../models/product.js';
import { STATUS_TRANSITIONS } from '../models/Order.js';
import { sendEmailVerificationCode, sendOrderStatusEmail } from '../services/email.js';
import { protect, optionalProtect, admin } from '../middleware/authMiddleware.js';
import { getEffectivePrice } from '../utils/productPricing.js';

const router = express.Router();
const VERIFICATION_WINDOW_MS = 10 * 60 * 1000;
const VERIFICATION_RESEND_WAIT_MS = 60 * 1000;
const MAX_VERIFICATION_ATTEMPTS = 5;

const normalizeEmail = (email) => typeof email === 'string' ? email.trim().toLowerCase() : '';
const hashVerificationCode = (code) => createHash('sha256').update(code).digest('hex');
const isVerificationCodeMatch = (submitted, expectedHash) => {
  const submittedHash = hashVerificationCode(submitted);
  return timingSafeEqual(Buffer.from(submittedHash, 'hex'), Buffer.from(expectedHash, 'hex'));
};

const issueVerificationCode = async (user, recipient, pendingEmail = null) => {
  const now = new Date();
  if (user.emailVerificationSentAt && now - user.emailVerificationSentAt < VERIFICATION_RESEND_WAIT_MS) {
    return { sent: false, rateLimited: true, message: 'Wait a minute before requesting another code.' };
  }
  const code = String(randomInt(0, 1000000)).padStart(6, '0');
  user.pendingEmail = pendingEmail;
  user.emailVerificationCodeHash = hashVerificationCode(code);
  user.emailVerificationExpiresAt = new Date(now.getTime() + VERIFICATION_WINDOW_MS);
  user.emailVerificationSentAt = now;
  user.emailVerificationAttempts = 0;
  await user.save();
  const result = await sendEmailVerificationCode(recipient, code);
  return { ...result, rateLimited: false };
};

const clearVerificationCode = (user) => {
  user.emailVerificationCodeHash = null;
  user.emailVerificationExpiresAt = null;
  user.emailVerificationSentAt = null;
  user.emailVerificationAttempts = 0;
};

const findUserByEmailInsensitive = (email) => User.findOne({
  email: { $regex: `^${email.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, $options: 'i' },
});

router.post('/inquiries', optionalProtect, async (req, res) => {
  try {
    if (req.user?.isAdmin) {
      return res.status(403).json({ message: 'Admin accounts cannot submit customer inquiries.' });
    }
    const { type, name, email, item, details, quantity, quantityUnit } = req.body;
    const parsedQuantity = Number(quantity);
    if (
      typeof name !== 'string' || !name.trim()
      || typeof email !== 'string' || !email.trim()
      || typeof item !== 'string' || !item.trim()
      || typeof details !== 'string' || !details.trim()
    ) {
      return res.status(400).json({ message: 'Please provide your name, email, subject and details.' });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      return res.status(400).json({ message: 'Please provide a valid email address.' });
    }
    if (!Number.isInteger(parsedQuantity) || parsedQuantity < 1) {
      return res.status(400).json({ message: 'Quantity must be a whole number greater than zero.' });
    }
    const inquiry = await Inquiry.create({
      type: ['project', 'support'].includes(type) ? type : 'project',
      name: name.trim(),
      email: email.trim(),
      item: item.trim(),
      details: details.trim(),
      quantity: parsedQuantity,
      quantityUnit: ['Pcs', 'Kg', 'Box'].includes(quantityUnit) ? quantityUnit : 'Pcs',
    });
    res.status(201).json({
      message: type === 'support' ? 'Your message has been sent successfully.' : 'Project request submitted successfully.',
      inquiryId: inquiry._id,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/verify-email', async (req, res) => {
  try {
    const email = normalizeEmail(req.body.email);
    const code = typeof req.body.code === 'string' ? req.body.code.trim() : '';
    if (!email || !/^\d{6}$/.test(code)) {
      return res.status(400).json({ message: 'Enter the email address and 6-digit verification code.' });
    }
    const user = await findUserByEmailInsensitive(email);
    if (!user) return res.status(400).json({ message: 'Invalid or expired verification code.' });
    if (user.emailVerified) return res.status(200).json({ message: 'Email is already verified.' });
    if (!user.emailVerificationCodeHash || !user.emailVerificationExpiresAt || user.emailVerificationExpiresAt <= new Date()) {
      return res.status(400).json({ message: 'Verification code expired. Request a new code.' });
    }
    if (user.emailVerificationAttempts >= MAX_VERIFICATION_ATTEMPTS) {
      return res.status(429).json({ message: 'Too many incorrect codes. Request a new code.' });
    }
    user.emailVerificationAttempts += 1;
    if (!isVerificationCodeMatch(code, user.emailVerificationCodeHash)) {
      await user.save();
      return res.status(400).json({ message: 'Invalid or expired verification code.' });
    }
    user.emailVerified = true;
    user.pendingEmail = null;
    clearVerificationCode(user);
    await user.save();
    res.status(200).json({ message: 'Email verified. You can now sign in.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/resend-verification', async (req, res) => {
  try {
    const email = normalizeEmail(req.body.email);
    const genericMessage = 'If the account needs verification, a new code will be sent when available.';
    if (!email) return res.status(200).json({ message: genericMessage });
    const user = await findUserByEmailInsensitive(email);
    if (!user || user.emailVerified || user.pendingEmail) {
      return res.status(200).json({ message: genericMessage });
    }
    const result = await issueVerificationCode(user, user.email);
    if (result.rateLimited) return res.status(429).json({ message: result.message });
    if (!result.sent) return res.status(503).json({ message: 'Could not send the verification email. Please try again later.' });
    res.status(200).json({ message: 'A new verification code has been sent.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/profile/email-verification', protect, async (req, res) => {
  try {
    const email = normalizeEmail(req.body.email);
    const { currentPassword } = req.body;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) {
      return res.status(400).json({ message: 'Please provide a valid email address.' });
    }
    if (typeof currentPassword !== 'string' || !currentPassword) {
      return res.status(400).json({ message: 'Enter your current password to change your email.' });
    }
    const user = await User.findById(req.user._id);
    if (!user || !(await user.matchPassword(currentPassword))) {
      return res.status(401).json({ message: 'Your current password is incorrect.' });
    }
    if (email === user.email.toLowerCase()) {
      return res.status(400).json({ message: 'This is already your email address.' });
    }
    if (await findUserByEmailInsensitive(email)) {
      return res.status(409).json({ message: 'That email address is already in use.' });
    }
    const result = await issueVerificationCode(user, email, email);
    if (result.rateLimited) return res.status(429).json({ message: result.message });
    if (!result.sent) return res.status(503).json({ message: 'Could not send the verification email. Please try again later.' });
    res.status(200).json({ message: 'A verification code has been sent to your new email address.' });
  } catch (error) {
    if (error.code === 11000) return res.status(409).json({ message: 'That email address is already in use.' });
    res.status(error.name === 'ValidationError' ? 400 : 500).json({ message: error.message });
  }
});

router.post('/profile/resend-email-verification', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user?.pendingEmail) {
      return res.status(400).json({ message: 'There is no email change waiting for verification.' });
    }
    const result = await issueVerificationCode(user, user.pendingEmail, user.pendingEmail);
    if (result.rateLimited) return res.status(429).json({ message: result.message });
    if (!result.sent) return res.status(503).json({ message: 'Could not send the verification email. Please try again later.' });
    res.status(200).json({ message: 'A new verification code has been sent.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/profile/verify-email', protect, async (req, res) => {
  try {
    const code = typeof req.body.code === 'string' ? req.body.code.trim() : '';
    const user = await User.findById(req.user._id);
    if (!user || !user.pendingEmail || !user.emailVerificationCodeHash || !user.emailVerificationExpiresAt) {
      return res.status(400).json({ message: 'No pending email change was found.' });
    }
    if (!/^\d{6}$/.test(code) || user.emailVerificationExpiresAt <= new Date()) {
      return res.status(400).json({ message: 'Invalid or expired verification code.' });
    }
    if (user.emailVerificationAttempts >= MAX_VERIFICATION_ATTEMPTS) {
      return res.status(429).json({ message: 'Too many incorrect codes. Request a new verification email.' });
    }
    user.emailVerificationAttempts += 1;
    if (!isVerificationCodeMatch(code, user.emailVerificationCodeHash)) {
      await user.save();
      return res.status(400).json({ message: 'Invalid or expired verification code.' });
    }
    const pendingEmail = user.pendingEmail;
    if (await findUserByEmailInsensitive(pendingEmail)) {
      clearVerificationCode(user);
      user.pendingEmail = null;
      await user.save();
      return res.status(409).json({ message: 'That email address is already in use.' });
    }
    user.email = pendingEmail;
    user.emailVerified = true;
    user.pendingEmail = null;
    clearVerificationCode(user);
    await user.save();
    res.status(200).json({ _id: user._id, name: user.name, email: user.email, isAdmin: user.isAdmin });
  } catch (error) {
    if (error.code === 11000) return res.status(409).json({ message: 'That email address is already in use.' });
    res.status(error.name === 'ValidationError' ? 400 : 500).json({ message: error.message });
  }
});

router.put('/profile', protect, async (req, res) => {
  try {
    const { name, email, currentPassword, newPassword } = req.body;
    const normalizedName = typeof name === 'string' ? name.trim() : '';
    const normalizedEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';

    if (!normalizedName || normalizedName.length > 100) {
      return res.status(400).json({ message: 'Name is required and must be 100 characters or fewer.' });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail) || normalizedEmail.length > 254) {
      return res.status(400).json({ message: 'Please provide a valid email address.' });
    }
    if (typeof currentPassword !== 'string' || !currentPassword) {
      return res.status(400).json({ message: 'Enter your current password to save profile changes.' });
    }
    if (newPassword !== undefined && newPassword !== '' && (typeof newPassword !== 'string' || newPassword.length < 8)) {
      return res.status(400).json({ message: 'New password must be at least 8 characters long.' });
    }

    const user = await User.findById(req.user._id);
    if (!user || !(await user.matchPassword(currentPassword))) {
      return res.status(401).json({ message: 'Your current password is incorrect.' });
    }
    if (normalizedEmail !== user.email.toLowerCase()) {
      return res.status(400).json({ message: 'Verify your new email address before changing it.' });
    }

    user.name = normalizedName;
    if (newPassword) user.password = newPassword;
    await user.save();

    res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
    });
  } catch (error) {
    if (error.code === 11000) return res.status(409).json({ message: 'That email address is already in use.' });
    res.status(error.name === 'ValidationError' ? 400 : 500).json({ message: error.message });
  }
});

// @desc    Register user
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const normalizedName = typeof name === 'string' ? name.trim() : '';
    const normalizedEmail = normalizeEmail(email);
    if (!normalizedName || normalizedName.length > 100) {
      return res.status(400).json({ message: 'Name is required and must be 100 characters or fewer.' });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail) || normalizedEmail.length > 254) {
      return res.status(400).json({ message: 'Please provide a valid email address.' });
    }
    if (typeof password !== 'string' || password.length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters long.' });
    }
    let user = await findUserByEmailInsensitive(normalizedEmail);
    if (user?.emailVerified) return res.status(400).json({ message: 'User already exists' });
    const isResendingVerification = Boolean(user);
    if (user && !(await user.matchPassword(password))) {
      return res.status(409).json({ message: 'Registration is already in progress for this email. Use the password you chose when you registered.' });
    }
    if (!user) {
      user = await User.create({ name: normalizedName, email: normalizedEmail, password, emailVerified: false });
    }
    const result = await issueVerificationCode(user, normalizedEmail);
    res.status(201).json({
      message: result.sent
        ? 'Verification code sent. Check your email.'
        : result.message || (isResendingVerification
          ? 'Could not resend the verification email. Please try again later.'
          : 'Your account was created, but the verification email could not be sent. Use resend after the email service is configured.'),
      emailSent: result.sent,
      verificationRequired: true,
    });
  } catch (error) {
    if (error.code === 11000) return res.status(409).json({ message: 'User already exists.' });
    res.status(500).json({ message: error.message });
  }
});

// @desc    Get user order history
// @route   GET /api/users/orders
// @access  Private
router.get('/orders', protect, async (req, res) => {
  try {
    if (req.user.isAdmin) return res.status(200).json([]);
    const visibleTerminalAt = new Date(Date.now() - 86400000);
    const orders = await Order.find({
      user: req.user._id,
      $or: [{ terminalAt: null }, { terminalAt: { $gt: visibleTerminalAt } }],
    }).sort({ createdAt: -1 }).populate('orderItems.product', 'name image price');
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/admin/orders', protect, admin, async (req, res) => {
  try {
    const customerIds = await User.distinct('_id', { isAdmin: { $ne: true } });
    const visibleTerminalAt = new Date(Date.now() - 86400000);
    const orders = await Order.find({
      user: { $in: customerIds },
      $or: [{ terminalAt: null }, { terminalAt: { $gt: visibleTerminalAt } }],
    })
      .sort({ createdAt: -1 })
      .populate('user', 'name email isAdmin')
      .populate('orderItems.product', 'name image price');
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
    const users = await User.find({ isAdmin: { $ne: true } }).select('-password').sort({ createdAt: -1 });
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete('/admin/customers/:id', protect, admin, async (req, res) => {
  try {
    const customer = await User.findById(req.params.id);
    if (!customer) return res.status(404).json({ message: 'Customer not found.' });
    if (customer.isAdmin) return res.status(403).json({ message: 'Admin accounts cannot be deleted here.' });

    await customer.deleteOne();
    res.json({ message: 'Customer account deleted. Order records were retained.' });
  } catch (error) {
    res.status(error.name === 'CastError' ? 400 : 500).json({ message: error.message });
  }
});

router.get('/admin/inquiries', protect, admin, async (req, res) => {
  try {
    const { type } = req.query;
    if (!['project', 'support'].includes(type)) {
      return res.status(400).json({ message: 'Inquiry type must be project or support.' });
    }
    const legacyTypeFilter = type === 'support'
      ? { type: { $exists: false }, item: 'Customer support' }
      : { type: { $exists: false }, item: { $ne: 'Customer support' } };
    const inquiries = await Inquiry.find({
      $or: [{ type }, legacyTypeFilter],
    }).sort({ createdAt: -1 });
    res.status(200).json(inquiries);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete('/admin/inquiries/:id', protect, admin, async (req, res) => {
  try {
    const inquiry = await Inquiry.findByIdAndDelete(req.params.id);
    if (!inquiry) return res.status(404).json({ message: 'Customer message or project request not found.' });
    res.json({ message: 'Message or project request deleted.' });
  } catch (error) {
    res.status(error.name === 'CastError' ? 400 : 500).json({ message: error.message });
  }
});

// @desc    Create a new order
// @route   POST /api/users/orders
// @access  Private
router.post('/orders', protect, async (req, res) => {
  try {
    if (req.user.isAdmin) {
      return res.status(403).json({ message: 'Admin accounts cannot place customer orders.' });
    }
    const { orderItems, shippingAddress, paymentMethod } = req.body;

    if (!Array.isArray(orderItems) || orderItems.length === 0 || orderItems.length > 50) {
      return res.status(400).json({ message: 'Please provide between 1 and 50 order items.' });
    }
    const checkoutKey = req.get('Idempotency-Key');
    if (!checkoutKey || !/^[\da-f-]{36}$/i.test(checkoutKey)) {
      return res.status(400).json({ message: 'A valid checkout key is required. Please try checkout again.' });
    }
    if (paymentMethod && paymentMethod !== 'COD') {
      return res.status(400).json({ message: 'Unsupported payment method.' });
    }
    const a = shippingAddress || {};
    if (
      typeof a.fullName !== 'string' || !a.fullName.trim()
      || typeof a.phone !== 'string' || !a.phone.trim()
      || typeof a.address !== 'string' || !a.address.trim()
      || typeof a.city !== 'string' || !a.city.trim()
      || (a.postalCode != null && typeof a.postalCode !== 'string')
    ) {
      return res.status(400).json({ message: 'Please provide full name, phone, address and city' });
    }

    const requestedItems = orderItems.map((item) => {
      if (!item || typeof item !== 'object' || !mongoose.isValidObjectId(item.product)) {
        throw Object.assign(new Error('Invalid product in order.'), { status: 400 });
      }
      const qty = Number(item.qty);
      if (!Number.isSafeInteger(qty) || qty < 1) {
        throw Object.assign(new Error('Each product quantity must be a positive whole number.'), { status: 400 });
      }
      return { product: String(item.product), qty };
    });
    const normalizedAddress = {
      fullName: a.fullName.trim(),
      phone: a.phone.trim(),
      address: a.address.trim(),
      city: a.city.trim(),
      postalCode: (a.postalCode || '').trim(),
    };
    const checkoutFingerprint = createHash('sha256')
      .update(JSON.stringify({
        items: [...requestedItems].sort((left, right) => left.product.localeCompare(right.product)),
        shippingAddress: normalizedAddress,
        paymentMethod: paymentMethod || 'COD',
      }))
      .digest('hex');

    const session = await mongoose.startSession();
    let order;
    let replay = false;
    try {
      await session.withTransaction(async () => {
        const previousOrder = await Order.findOne({ user: req.user._id, checkoutKey }).session(session);
        if (previousOrder) {
          if (previousOrder.checkoutFingerprint !== checkoutFingerprint) {
            throw Object.assign(new Error('This checkout key was already used for a different order.'), { status: 409 });
          }
          order = previousOrder;
          replay = true;
          return;
        }

        const finalItems = [];
        let totalPrice = 0;
        for (const item of requestedItems) {
          const product = await Product.findOneAndUpdate(
            { _id: item.product, stock: { $gte: item.qty } },
            { $inc: { stock: -item.qty } },
            { new: true, session }
          );
          if (!product) {
            throw Object.assign(new Error('Product not found or insufficient stock.'), { status: 400 });
          }
          const price = getEffectivePrice(product);
          finalItems.push({
            name: product.name,
            qty: item.qty,
            image: product.image,
            price,
            product: product._id,
          });
          totalPrice += price * item.qty;
        }

        [order] = await Order.create([{
          user: req.user._id,
          checkoutKey,
          checkoutFingerprint,
          orderItems: finalItems,
          shippingAddress: normalizedAddress,
          paymentMethod: paymentMethod || 'COD',
          totalPrice,
          status: 'pending',
          statusHistory: [{ status: 'pending' }],
          stockDeducted: true,
        }], { session });
      });
    } catch (error) {
      if (error.code === 11000) {
        order = await Order.findOne({ user: req.user._id, checkoutKey });
        if (order && order.checkoutFingerprint !== checkoutFingerprint) {
          return res.status(409).json({ message: 'This checkout key was already used for a different order.' });
        }
        if (!order) throw error;
        replay = true;
      } else {
        throw error;
      }
    } finally {
      await session.endSession();
    }

    if (!order) throw new Error('Order transaction completed without an order.');
    const emailResult = replay ? null : await sendOrderStatusEmail(order, req.user, 'pending');
    const orderResponse = order.toObject();
    delete orderResponse.checkoutKey;
    delete orderResponse.checkoutFingerprint;
    res.status(201).json({
      ...orderResponse,
      emailSent: emailResult?.sent ?? null,
      idempotentReplay: replay,
    });
  } catch (error) {
    res.status(error.status || (error.name === 'CastError' ? 400 : 500)).json({ message: error.message });
  }
});

router.put('/admin/orders/:id/status', protect, admin, async (req, res) => {
  let order;
  try {
    const { status } = req.body;
    const session = await mongoose.startSession();
    try {
      await session.withTransaction(async () => {
        order = await Order.findById(req.params.id).session(session);
        if (!order) throw Object.assign(new Error('Order not found.'), { status: 404 });
        const customer = await User.findById(order.user).select('name email isAdmin').session(session);
        if (customer?.isAdmin) {
          throw Object.assign(new Error('Admin orders cannot be managed here.'), { status: 403 });
        }

        const allowed = STATUS_TRANSITIONS[order.status] || [];
        if (!allowed.includes(status)) {
          throw Object.assign(
            new Error(`Cannot change order from "${order.status}" to "${status}".`),
            { status: 400 }
          );
        }

        order.status = status;
        order.statusHistory.push({ status });
        order.terminalAt = ['delivered', 'cancelled'].includes(status) ? new Date() : null;
        if (status === 'cancelled' && order.stockDeducted) {
          for (const item of order.orderItems) {
            const result = await Product.updateOne(
              { _id: item.product },
              { $inc: { stock: item.qty } },
              { session }
            );
            if (result.matchedCount !== 1) {
              throw new Error(`Could not restore stock for product ${item.product}.`);
            }
          }
          order.stockDeducted = false;
        }
        await order.save({ session });
      });
    } finally {
      await session.endSession();
    }
    await order.populate('user', 'name email isAdmin');

    const emailResult = order.user
      ? await sendOrderStatusEmail(order, order.user, status)
      : { sent: false, message: 'The customer account was deleted, so no status email was sent.' };
    res.json({
      order,
      emailSent: emailResult.sent,
      emailMessage: emailResult.message || null,
      emailTestMode: emailResult.testMode || false,
    });
  } catch (error) {
    res.status(error.status || (error.name === 'CastError' ? 400 : 500)).json({ message: error.message });
  }
});

// @desc    Login user
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await findUserByEmailInsensitive(normalizeEmail(email));
    if (user && (await user.matchPassword(password))) {
      if (!user.emailVerified) {
        return res.status(403).json({
          message: 'Please complete email verification from the registration page before signing in.',
        });
      }
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