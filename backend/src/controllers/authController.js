import bcrypt from 'bcrypt';
import User from '../models/User.js';
import { generateToken } from '../utils/generateToken.js';
const safeUser = (user) => ({ id: user.id, name: user.name, email: user.email, role: user.role });
export async function login(req, res, next) {
  try { const { email, password } = req.body; if (!email || !password) return res.status(400).json({ message: 'Email and password are required.' }); const user = await User.findOne({ email: email.toLowerCase() }).select('+passwordHash'); if (!user || !(await bcrypt.compare(password, user.passwordHash))) return res.status(401).json({ message: 'Invalid email or password.' }); res.json({ token: generateToken(user.id), user: safeUser(user) }); } catch (e) { next(e); }
}
export function me(req, res) { res.json({ user: safeUser(req.user) }); }
