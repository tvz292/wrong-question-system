import request from 'supertest';
import express from 'express';
import { recordsRouter } from '../src/routes/records';
import jwt from 'jsonwebtoken';

// Mock Prisma
jest.mock('../src/utils/prisma', () => ({
  incorrectRecord: {
    create: jest.fn(),
    findMany: jest.fn(),
    update: jest.fn(),
    findUnique: jest.fn(),
  },
  question: {
    findUnique: jest.fn(),
  },
}));

import prisma from '../src/utils/prisma';

const app = express();
app.use(express.json());
app.use('/api/records', recordsRouter);

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const mockUser = { id: 'user-id-123', username: 'testuser' };
const mockToken = jwt.sign(mockUser, JWT_SECRET);

describe('Records API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/records', () => {
    it('should link a question to the student', async () => {
      const questionId = 'question-id-456';
      const mockRecord = {
        id: 'record-id-789',
        userId: mockUser.id,
        questionId: questionId,
        status: 'TO_REVIEW',
        reviewCount: 0,
      };

      (prisma.incorrectRecord.create as jest.Mock).mockResolvedValue(mockRecord);
      (prisma.question.findUnique as jest.Mock).mockResolvedValue({ id: questionId });

      const res = await request(app)
        .post('/api/records')
        .set('Authorization', `Bearer ${mockToken}`)
        .send({ questionId });

      expect(res.status).toBe(201);
      expect(res.body).toEqual(mockRecord);
      expect(prisma.incorrectRecord.create).toHaveBeenCalledWith({
        data: {
          userId: mockUser.id,
          questionId,
          status: 'TO_REVIEW',
        },
      });
    });

    it('should return 401 when not authenticated', async () => {
      const res = await request(app)
        .post('/api/records')
        .send({ questionId: '123' });

      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/records', () => {
    it('should fetch student own records with joined question data', async () => {
      const mockRecords = [
        {
          id: 'record-1',
          userId: mockUser.id,
          questionId: 'q-1',
          status: 'TO_REVIEW',
          question: { id: 'q-1', contentText: 'Question 1' }
        }
      ];

      (prisma.incorrectRecord.findMany as jest.Mock).mockResolvedValue(mockRecords);

      const res = await request(app)
        .get('/api/records')
        .set('Authorization', `Bearer ${mockToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toEqual(mockRecords);
      expect(prisma.incorrectRecord.findMany).toHaveBeenCalledWith({
        where: { userId: mockUser.id },
        include: { question: true }
      });
    });
  });

  describe('PATCH /api/records/:id', () => {
    it('should update record status and counts', async () => {
      const recordId = 'record-1';
      const updateData = {
        status: 'MASTERED',
        reviewCount: 1,
        studentAnswer: 'My Answer'
      };

      (prisma.incorrectRecord.findUnique as jest.Mock).mockResolvedValue({
        id: recordId,
        userId: mockUser.id
      });
      (prisma.incorrectRecord.update as jest.Mock).mockResolvedValue({
        id: recordId,
        ...updateData
      });

      const res = await request(app)
        .patch(`/api/records/${recordId}`)
        .set('Authorization', `Bearer ${mockToken}`)
        .send(updateData);

      expect(res.status).toBe(200);
      expect(res.body.status).toBe('MASTERED');
      expect(prisma.incorrectRecord.update).toHaveBeenCalledWith({
        where: { id: recordId },
        data: expect.objectContaining(updateData)
      });
    });

    it('should return 404 if record not found or does not belong to user', async () => {
      (prisma.incorrectRecord.findUnique as jest.Mock).mockResolvedValue(null);

      const res = await request(app)
        .patch('/api/records/invalid-id')
        .set('Authorization', `Bearer ${mockToken}`)
        .send({ status: 'MASTERED' });

      expect(res.status).toBe(404);
    });
  });
});
