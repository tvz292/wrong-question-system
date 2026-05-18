import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../utils/prisma';

export const authRouter = Router();

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

authRouter.post('/register', async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, email, password, role } = req.body;

    // Validate role if provided
    const validRoles = ['STUDENT', 'TEACHER', 'ADMIN'];
    const assignedRole = role && validRoles.includes(role) ? role : 'STUDENT';

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email },
          { username }
        ]
      }
    });

    if (existingUser) {
      res.status(400).json({ error: 'User with this email or username already exists' });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        username,
        email,
        passwordHash: hashedPassword,
        role: assignedRole,
      },
    });

    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, {
      expiresIn: '24h',
    });

    res.status(201).json({ token, role: user.role });
  } catch (error) {
    console.error('Registration error details:', error);
    res.status(400).json({ error: error instanceof Error ? error.message : 'Registration failed' });
  }
});

authRouter.post('/login', async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, {
      expiresIn: '24h',
    });

    res.status(200).json({ token, role: user.role });
  } catch (error) {
    res.status(500).json({ error: 'Login failed' });
  }
});
