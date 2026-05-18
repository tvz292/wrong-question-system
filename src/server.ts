import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import { authRouter } from './routes/auth';
import { questionRouter } from './routes/questions';
import { recordsRouter } from './routes/records';
import { execSync } from 'child_process';
import prisma from './utils/prisma';

const app = express();
const PORT = Number(process.env.PORT) || 3001;

app.use(cors());
app.use(express.json());

// Emergency Database Synchronization
async function ensureDatabaseIsReady() {
  try {
    console.log('Ensuring database schema is synced...');
    // Force sync the schema to the database programmatically
    execSync('npx prisma db push --accept-data-loss', { stdio: 'inherit' });
    console.log('Database schema sync completed');
    
    await prisma.$connect();
    await prisma.user.count();
    console.log('Database connection and tables verified');
  } catch (err: any) {
    console.error('CRITICAL DATABASE ERROR:', err.message);
    // Don't exit yet, try to run anyway but we've logged the failure
  }
}

ensureDatabaseIsReady();

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
