import { Router, Response } from 'express';
import prisma from '../utils/prisma';
import { authMiddleware, AuthRequest } from '../middleware/auth';

export const recordsRouter = Router();

// Create a new incorrect record
recordsRouter.post('/', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { questionId, studentAnswer } = req.body;
    const userId = req.user.id;

    if (!questionId) {
      res.status(400).json({ error: 'questionId is required' });
      return;
    }

    // Verify question exists
    const question = await prisma.question.findUnique({
      where: { id: questionId }
    });

    if (!question) {
      res.status(404).json({ error: 'Question not found' });
      return;
    }

    const record = await prisma.incorrectRecord.create({
      data: {
        userId,
        questionId,
        studentAnswer,
        status: 'TO_REVIEW'
      }
    });

    res.status(201).json(record);
  } catch (error) {
    console.error('Error creating record:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Fetch user's own records
recordsRouter.get('/', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user.id;

    const records = await prisma.incorrectRecord.findMany({
      where: { userId },
      include: {
        question: true
      }
    });

    res.status(200).json(records);
  } catch (error) {
    console.error('Error fetching records:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update record status and review count
recordsRouter.patch('/:id', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status, studentAnswer } = req.body;
    const userId = req.user.id;

    // Verify record exists and belongs to user
    const record = await prisma.incorrectRecord.findUnique({
      where: { id: id as string }
    });

    if (!record) {
      res.status(404).json({ error: 'Record not found' });
      return;
    }

    if (record.userId !== userId) {
      res.status(403).json({ error: 'Access denied' });
      return;
    }

    const updatedRecord = await prisma.incorrectRecord.update({
      where: { id: id as string },
      data: {
        status,
        studentAnswer,
        reviewCount: typeof req.body.reviewCount === 'number' ? req.body.reviewCount : {
          increment: 1
        },
        lastReviewedAt: new Date()
      }
    });

    res.status(200).json(updatedRecord);
  } catch (error) {
    console.error('Error updating record:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});
