import mongoose, { Schema, Document, Model } from 'mongoose';
import { IChatMessage } from '../types';

interface IChatSession extends Document {
  sessionId: string;
  history: IChatMessage[];
  createdAt: Date;
  updatedAt: Date;
}

const ChatSessionSchema: Schema = new Schema({
  sessionId: { type: String, required: true, unique: true },
  history: [{
    role: { type: String, enum: ['user', 'model'], required: true },
    parts: { type: String, required: true }
  }]
}, { timestamps: true });

export const ChatSession: Model<IChatSession> = mongoose.model<IChatSession>('ChatSession', ChatSessionSchema);