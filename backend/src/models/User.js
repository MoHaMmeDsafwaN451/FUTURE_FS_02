import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 100 },
  email: { type: String, required: true, unique: true, trim: true, lowercase: true },
  phone: { type: String, trim: true, maxlength: 30, default: '' },
  jobTitle: { type: String, trim: true, maxlength: 100, default: '' },
  bio: { type: String, trim: true, maxlength: 500, default: '' },
  passwordHash: { type: String, required: true, select: false },
  role: { type: String, enum: ['admin', 'user'], default: 'user' }
}, { timestamps: true });

export default mongoose.model('User', userSchema);
