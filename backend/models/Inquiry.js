import mongoose from 'mongoose';

const inquirySchema = new mongoose.Schema({
  type: { type: String, enum: ['project', 'support'], default: 'project' },
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, trim: true, lowercase: true },
  item: { type: String, required: true, trim: true },
  details: { type: String, required: true, trim: true },
  quantity: { type: Number, required: true, min: 1 },
  quantityUnit: { type: String, enum: ['Pcs', 'Kg', 'Box'], default: 'Pcs' },
  status: { type: String, enum: ['new', 'contacted'], default: 'new' },
}, { timestamps: true });

const Inquiry = mongoose.model('Inquiry', inquirySchema);
export default Inquiry;
