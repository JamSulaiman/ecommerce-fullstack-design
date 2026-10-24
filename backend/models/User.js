import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  emailVerified: { type: Boolean, default: true },
  pendingEmail: { type: String, default: null },
  emailVerificationCodeHash: { type: String, default: null },
  emailVerificationExpiresAt: { type: Date, default: null },
  emailVerificationSentAt: { type: Date, default: null },
  emailVerificationAttempts: { type: Number, default: 0 },
  password: { type: String, required: true },
  isAdmin: { type: Boolean, default: false },
}, { timestamps: true });

userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

const User = mongoose.model('User', userSchema);
export default User;