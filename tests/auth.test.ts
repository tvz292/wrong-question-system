import request from 'supertest';
import express from 'express';
import { authRouter } from '../src/routes/auth';

// Mock Prisma
jest.mock('../src/utils/prisma', () => ({
  user: {
    create: jest.fn(),
    findUnique: jest.fn(),
  },
}));

import prisma from '../src/utils/prisma';
import bcrypt from 'bcryptjs';

const app = express();
app.use(express.json());
app.use('/auth', authRouter);

describe('Auth API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should register a new user', async () => {
    const userData = {
      id: 'user-id-123',
      username: 'testuser',
      email: 'test@example.com',
      role: 'USER'
    };

    (prisma.user.create as jest.Mock).mockResolvedValue(userData);

    const res = await request(app)
      .post('/auth/register')
      .send({
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123'
      });
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('token');
  });

  it('should login an existing user', async () => {
    const password = 'password123';
    const hashedPassword = await bcrypt.hash(password, 10);
    const userData = {
      id: 'user-id-123',
      username: 'testuser',
      email: 'test@example.com',
      passwordHash: hashedPassword,
      role: 'USER'
    };

    (prisma.user.findUnique as jest.Mock).mockResolvedValue(userData);

    const res = await request(app)
      .post('/auth/login')
      .send({
        email: 'test@example.com',
        password: password
      });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('token');
  });
});
