import { Content } from "@google/generative-ai";

export interface IChatMessage {
  role: 'user' | 'model';
  parts: string;
}

export interface IRequest {
  sessionId: string;
  message: string;
}