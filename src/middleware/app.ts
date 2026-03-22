import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import taskRoutes from './routes/taskRoutes';
import userRoutes from './routes/userRoutes';
import cardRoutes from './routes/cardRoutes';
import studioRoutes from './routes/studioRoutes';
import { requireAuth } from './middleware/authMiddleware';
import { errorHandler } from './middleware/errorHandler';
import { getUploadsDir } from './config/storage';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use('/uploads', express.static(getUploadsDir()));

// Health check
app.get('/health', (req, res) => res.json({ status: 'ok' }));

// API routes
app.use('/api/users', requireAuth, userRoutes);
app.use('/api/tasks', requireAuth, taskRoutes);
app.use('/api/cards', requireAuth, cardRoutes);
app.use('/api/studio', requireAuth, studioRoutes);

// Global error handler
app.use(errorHandler);

export default app;
