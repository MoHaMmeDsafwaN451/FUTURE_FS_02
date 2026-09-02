import 'dotenv/config';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import { rateLimit } from 'express-rate-limit';

import { connectDatabase } from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import leadRoutes from './routes/leadRoutes.js';
import { errorHandler, notFound } from './middleware/errorMiddleware.js';

const app = express();

const allowedOrigins = (
  process.env.CLIENT_URL || 'http://localhost:5173'
)
  .split(',')
  .map((url) => url.trim());

app.use(
  cors({
    origin: allowedOrigins,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

app.use(helmet());
app.use(express.json({ limit: '100kb' }));

// Health check — does not require MongoDB
app.get('/api/health', (req, res) => {
  res.json({
    message: 'API is running',
    uptime: Math.round(process.uptime()),
  });
});

// Connect to MongoDB before database-dependent routes
app.use(async (req, res, next) => {
  try {
    await connectDatabase();
    next();
  } catch (error) {
    next(error);
  }
});

app.use(
  '/api/auth',
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 20,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    message: {
      message: 'Too many login attempts. Please try again later.',
    },
  }),
  authRoutes
);

app.use('/api/leads', leadRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;