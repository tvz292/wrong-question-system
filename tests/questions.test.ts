import request from 'supertest';
import express from 'express';
import { questionRouter } from '../src/routes/questions';
import jwt from 'jsonwebtoken';

// Mock Prisma
jest.mock('../src/utils/prisma', () => ({
  question: {
    create: jest.fn(),
    findMany: jest.fn(),
  },
}));

import prisma from '../src/utils/prisma';

const app = express();
app.use(express.json());
app.use('/api/questions', questionRouter);

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const mockUser = { id: 'user-id-123', username: 'testuser' };
const mockToken = jwt.sign(mockUser, JWT_SECRET);

describe('Questions API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/questions', () => {
    it('should create a new question when authenticated', async () => {
      const questionData = {
        contentText: 'What is 2+2?',
        tags: ['math', 'easy'],
        difficulty: 1,
        source: 'MANUAL'
      };

      (prisma.question.create as jest.Mock).mockResolvedValue({
        id: 'new-question-id',
        ...questionData,
        creatorId: mockUser.id
      });

      const res = await request(app)
        .post('/api/questions')
        .set('Authorization', `Bearer ${mockToken}`)
        .send(questionData);

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('id', 'new-question-id');
      expect(res.body.contentText).toBe(questionData.contentText);
      expect(prisma.question.create).toHaveBeenCalledWith({
        data: {
          ...questionData,
          imageUrl: undefined,
          creatorId: mockUser.id
        }
      });
    });

    it('should return 401 when not authenticated', async () => {
      const res = await request(app)
        .post('/api/questions')
        .send({ contentText: 'Unauthorized' });

      expect(res.status).toBe(401);
    });

    it('should return 400 for invalid source', async () => {
      const res = await request(app)
        .post('/api/questions')
        .set('Authorization', `Bearer ${mockToken}`)
        .send({ contentText: 'Invalid source', source: 'INVALID' });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error', 'Invalid source. Must be PHOTO, MANUAL, or FILE.');
    });
  });

  describe('GET /api/questions', () => {
    it('should fetch questions with tag filtering', async () => {
      const mockQuestions = [
        { id: '1', contentText: 'Q1', tags: ['math'] },
      ];
      (prisma.question.findMany as jest.Mock).mockResolvedValue(mockQuestions);

      const res = await request(app)
        .get('/api/questions')
        .query({ tag: 'math' });

      expect(res.status).toBe(200);
      expect(res.body).toEqual(mockQuestions);
      expect(prisma.question.findMany).toHaveBeenCalledWith({
        where: {
          tags: {
            array_contains: 'math'
          }
        }
      });
    });
  });
});
