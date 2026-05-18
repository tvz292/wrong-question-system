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
async function checkDatabase() {
  try {
    console.log('Connecting to database...');
    await prisma.$connect();
    console.log('Successfully connected to database');
    
    // Attempt a count on the users table (mapped to lowercase users)
    await prisma.user.count();
    console.log('Database tables verified');
  } catch (err: any) {
    console.error('DATABASE READINESS ERROR:', err.message);
    if (err.message.includes('does not exist')) {
      console.error('CRITICAL: Tables are missing. Attempting emergency fix might be needed.');
    }
    // In production, we want to know it failed
    process.exit(1);
  }
}

checkDatabase();

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
