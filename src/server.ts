import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import { authRouter } from './routes/auth';
import { questionRouter } from './routes/questions';
import { recordsRouter } from './routes/records';

const app = express();
const PORT = Number(process.env.PORT) || 3001;

app.use(express.json());

// Routes
app.use('/api/auth', authRouter);
app.use('/api/questions', questionRouter);
app.use('/api/records', recordsRouter);

// Basic health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK' });
});

app.listen(PORT, '0,0,0,0', () => {
  console.log(`Server is running on port ${PORT}`);
});

export default app;
