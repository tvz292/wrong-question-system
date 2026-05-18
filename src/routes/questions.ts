import { Router, Response } from 'express';
import prisma from '../utils/prisma';
import { authMiddleware, AuthRequest } from '../middleware/auth';

export const questionRouter = Router();

// Create a new question
questionRouter.post('/', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { contentText, imageUrl, tags, difficulty, source } = req.body;
    const creatorId = req.user.id;

    if (source && !['PHOTO', 'MANUAL', 'FILE'].includes(source)) {
      res.status(400).json({ error: 'Invalid source. Must be PHOTO, MANUAL, or FILE.' });
      return;
    }

    const question = await prisma.question.create({
      data: {
        contentText,
        imageUrl,
        tags: tags || [],
        difficulty: difficulty || 3,
        source: source || 'MANUAL',
        creatorId
      }
    });

    res.status(201).json(question);
  } catch (error) {
    console.error('Error creating question:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Fetch questions with optional tag filtering
questionRouter.get('/', async (req, res) => {
  try {
    const { tag } = req.query;

    let whereClause = {};
    if (tag) {
      whereClause = {
        tags: {
          array_contains: tag
        }
      };
    }

    const questions = await prisma.question.findMany({
      where: whereClause
    });

    res.status(200).json(questions);
  } catch (error) {
    console.error('Error fetching questions:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});
