import mongoose from 'mongoose';

export const ORDER_STATUSES = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];

// Kaun sa status kahan se kahan ja sakta hai (real-life flow)
export const STATUS_TRANSITIONS = {
  pending: ['confirmed', 'cancelled'],
  confirmed: ['shipped', 'cancelled'],
  shipped: ['delivered'],
  delivered: [],
  cancelled: [],
};

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User',
  },
  checkoutKey: { type: String, default: undefined },
  checkoutFingerprint: { type: String, default: undefined },
  orderItems: [
    {
      name: { type: String, required: true },
      qty: { type: Number, required: true },
      image: { type: String, required: true },
      price: { type: Number, required: true },
      product: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Product',
      },
    },
  ],
  shippingAddress: {
    fullName: { type: String },
    phone: { type: String },
    address: { type: String },
    city: { type: String },
    postalCode: { type: String },
  },
  paymentMethod: { type: String, default: 'COD' },
  totalPrice: {
    type: Number,
    required: true,
    default: 0,
  },
  status: { type: String, enum: ORDER_STATUSES, default: 'pending' },
  terminalAt: { type: Date, default: null },
  statusHistory: [
    {
      status: { type: String, enum: ORDER_STATUSES },
      date: { type: Date, default: Date.now },
    },
  ],
  // Stock sirf tab wapas hota hai jab order place par kam hua ho (purane orders safe rahein)
  stockDeducted: { type: Boolean, default: false },
}, {
  timestamps: true,
});

orderSchema.index({ terminalAt: 1 }, { expireAfterSeconds: 86400 });
orderSchema.index(
  { user: 1, checkoutKey: 1 },
  {
    unique: true,
    partialFilterExpression: { checkoutKey: { $type: 'string' } },
  }
);

const Order = mongoose.model('Order', orderSchema);
export default Order;
