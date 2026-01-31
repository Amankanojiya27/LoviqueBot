import { Request, Response } from 'express';
import { generateResponse } from '../services/geminiService';

export const chatController = async (req: Request, res: Response): Promise<void> => {
  try {
    const { sessionId, message } = req.body;

    // Basic Validation
    if (!sessionId || !message) {
      res.status(400).json({ error: 'sessionId and message are required' });
      return;
    }

    const reply = await generateResponse(sessionId, message);

    res.status(200).json({ 
      reply,
      sessionId // Return ID so frontend can keep track
    });

  } catch (error: any) {
    console.error('Controller Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};