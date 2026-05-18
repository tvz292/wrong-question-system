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

// Routes
app.use('/api/auth', authRouter);
app.use('/api/questions', questionRouter);
app.use('/api/records', recordsRouter);

// Basic health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK' });
});

// 1. Start server IMMEDIATELY to satisfy Render's port check
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on port ${PORT}`);
  
  // 2. Perform database sync in the BACKGROUND
  ensureDatabaseIsReady();
});

async function ensureDatabaseIsReady() {
  const { exec } = require('child_process');
  console.log('Starting background database sync...');
  
  exec('npx prisma db push --accept-data-loss', (error: any, stdout: any, stderr: any) => {
    if (error) {
      console.error('BACKGROUND DB SYNC FAILED:', error.message);
      return;
    }
    console.log('Database schema sync completed successfully');
    console.log(stdout);
  });
}

export default app;
