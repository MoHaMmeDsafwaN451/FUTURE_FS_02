import bcrypt from 'bcrypt';
import User from '../models/User.js';
import { generateToken } from '../utils/generateToken.js';
const safeUser = (user) => ({ id: user.id, name: user.name, email: user.email, phone: user.phone || '', jobTitle: user.jobTitle || '', bio: user.bio || '', role: user.role });
const validEmail = (email) => /^\S+@\S+\.\S+$/.test(email);
export async function register(req, res, next) {
  try {
    const { name, email, password } = req.body;
    if (!name?.trim() || !email?.trim() || !password) return res.status(400).json({ message: 'Name, email, and password are required.' });
    if (!validEmail(email)) return res.status(400).json({ message: 'Enter a valid email address.' });
    if (password.length < 8) return res.status(400).json({ message: 'Password must contain at least 8 characters.' });
    const normalizedEmail = email.toLowerCase();
    if (await User.exists({ email: normalizedEmail })) return res.status(409).json({ message: 'An account with this email already exists.' });
    const user = await User.create({ name, email: normalizedEmail, passwordHash: await bcrypt.hash(password, 12), role: 'user' });
    res.status(201).json({ token: generateToken(user.id), user: safeUser(user) });
  } catch (e) { next(e); }
}
export async function login(req, res, next) {
  try { const { email, password } = req.body; if (!email || !password) return res.status(400).json({ message: 'Email and password are required.' }); const user = await User.findOne({ email: email.toLowerCase() }).select('+passwordHash'); if (!user || !(await bcrypt.compare(password, user.passwordHash))) return res.status(401).json({ message: 'Invalid email or password.' }); res.json({ token: generateToken(user.id), user: safeUser(user) }); } catch (e) { next(e); }
}
export function me(req, res) { res.json({ user: safeUser(req.user) }); }
export async function updateProfile(req, res, next) {
  try {
    const { name, email, phone = '', jobTitle = '', bio = '' } = req.body;
    if (!name?.trim() || !email?.trim()) return res.status(400).json({ message: 'Name and email are required.' });
    if (!validEmail(email)) return res.status(400).json({ message: 'Enter a valid email address.' });
    const normalizedEmail = email.toLowerCase();
    const existing = await User.findOne({ email: normalizedEmail, _id: { $ne: req.user.id } });
    if (existing) return res.status(409).json({ message: 'An account with this email already exists.' });
    const user = await User.findByIdAndUpdate(req.user.id, { name, email: normalizedEmail, phone, jobTitle, bio }, { new: true, runValidators: true });
    res.json({ user: safeUser(user) });
  } catch (e) { next(e); }
}
