import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import { authRouter } from './routes/auth';
import { questionRouter } from './routes/questions';
import { recordsRouter } from './routes/records';
import prisma from './utils/prisma';

const app = express();
const PORT = Number(process.env.PORT) || 3001;

app.use(cors());
app.use(express.json());

// Database connection check
prisma.$connect()
  .then(async () => {
    console.log('Successfully connected to database');
    // Simple query to verify tables exist
    try {
      await prisma.user.count();
      console.log('Database tables verified');
    } catch (err) {
      console.error('Database tables check failed:', err);
    }
  })
  .catch((err) => {
    console.error('Failed to connect to database:', err);
  });

// Routes
app.use('/api/auth', authRouter);
app.use('/api/questions', questionRouter);
app.use('/api/records', recordsRouter);

// Basic health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK' });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on port ${PORT}`);
});

export default app;
