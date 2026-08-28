import mongoose from 'mongoose';

const leadSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 100 },
  email: { type: String, required: true, trim: true, lowercase: true, maxlength: 254 },
  phone: { type: String, trim: true, maxlength: 30, default: '' },
  company: { type: String, trim: true, maxlength: 100, default: '' },
  source: { type: String, enum: ['website', 'linkedin', 'referral', 'instagram', 'google', 'other'], default: 'other' },
  status: { type: String, enum: ['new', 'contacted', 'qualified', 'converted', 'lost'], default: 'new' },
  notes: { type: String, trim: true, maxlength: 3000, default: '' },
  followUpDate: { type: Date, default: null }
}, { timestamps: true });

export default mongoose.model('Lead', leadSchema);
