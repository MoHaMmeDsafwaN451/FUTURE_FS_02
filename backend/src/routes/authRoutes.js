import { Router } from 'express';
import { login, me, register, updateProfile } from '../controllers/authController.js';
import { requireAuth } from '../middleware/authMiddleware.js';
const router = Router();
router.post('/login', login);
router.post('/register', register);
router.get('/me', requireAuth, me);
router.put('/me', requireAuth, updateProfile);
export default router;
