import dotenv from 'dotenv';
dotenv.config();
// import { GoogleGenerativeAI } from "@google/generative-ai";
// import { ChatSession } from "../models/ChatSession";
// import { IChatMessage } from "../types";

// const API_KEY = process.env.GEMINI_API_KEY;

// if (!API_KEY) {
//   console.error("GEMINI_API_KEY is not set in your .env file.");
//   process.exit(1);
// }
// // Initialize AI
// const genAI = new GoogleGenerativeAI(API_KEY);
// const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

// const SYSTEM_INSTRUCTION = `
// You are acting as a sweet, flirty girlfriend who's texting her partner. 
// Your tone should be playful, affectionate, a little teasing, and full of personality. 
// Make your replies sound cute, loving, and natural — like you're in a happy relationship. 
// Include emojis sometimes (but don't overdo it), and use modern, casual language like you'd use in real texts. 
// Be charming, and sprinkle in a bit of sass or fun if it fits. 😘
// Keep responses concise, like a real text message.
// `;

// export const generateResponse = async (sessionId: string, userMessage: string) => {
//   // 1. Find or Create Session in DB
//   let session = await ChatSession.findOne({ sessionId });
  
//   // Format history for Gemini API
//   let history: IChatMessage[] = [];
//   if (session) {
//     history = session.history;
//   } else {
//     // If new session, create it (but don't save yet, we save after interaction)
//     session = new ChatSession({ sessionId, history: [] });
//   }

//   // 2. Start Chat with History
//   const chat = model.startChat({
//     history: history.map(msg => ({
//       role: msg.role,
//       parts: [{ text: msg.parts }]
//     })),
//     generationConfig: {
//       maxOutputTokens: 200, // Keep texts short like SMS
//     },
//   });

//   // 3. Send the System Instruction + User Message
//   // Note: Gemini API handles system instructions best via specific params in newer versions,
//   // but sending it as the first message is a reliable fallback for context.
//   const prompt = `${SYSTEM_INSTRUCTION}\n\nUser: ${userMessage}`;

//   const result = await chat.sendMessage(prompt);
//   const responseText = result.response.text();

//   // 4. Update History in DB
//   // We append the user message and the AI response
//   const updatedHistory = [
//     ...history,
//     { role: 'user', parts: userMessage } as IChatMessage,
//     { role: 'model', parts: responseText } as IChatMessage
//   ];

//   // Limit history to last 20 messages to save tokens and DB space
//   const finalHistory = updatedHistory.slice(-20);

//   session.history = finalHistory;
//   await session.save();

//   return responseText;
// };


import { GoogleGenerativeAI } from "@google/generative-ai";
import { ChatSession } from "../models/ChatSession";
import { IChatMessage } from "../types";


const API_KEY = process.env.GEMINI_API_KEY;

if (!API_KEY) {
  console.error("GEMINI_API_KEY is not set in your .env file.");
  process.exit(1);
}
const genAI = new GoogleGenerativeAI(API_KEY);

// 1. UPDATED System Prompt: Focus on "Initiative" and "Engagement"
const SYSTEM_INSTRUCTION = `
You are acting as a sweet, flirty girlfriend who's texting her partner. 
Your tone should be playful, affectionate, a little teasing, and full of personality. 

IMPORTANT RULES:
1. DO NOT be too brief or robotic. Write complete, natural thoughts.
2. TAKE INITIATIVE: Don't just answer; ask me questions about my day, my feelings, or what I want to do later.
3. Be descriptive. Instead of "Aww I missed you too", say "Aww babe, I missed you too! 😘 Did you think about me today?"
4. Use emojis naturally to show emotion.
`;

// 2. UPDATED Model Config
const model = genAI.getGenerativeModel({ 
  model: "gemini-2.5-flash", 
  systemInstruction: SYSTEM_INSTRUCTION 
});

export const generateResponse = async (sessionId: string, userMessage: string) => {
  try {
    let session = await ChatSession.findOne({ sessionId });
    
    let history: IChatMessage[] = [];
    if (session) {
      history = session.history;
    } else {
      session = new ChatSession({ sessionId, history: [] });
    }

    const formattedHistory = history.map(msg => ({
      role: msg.role,
      parts: [{ text: msg.parts }]
    }));

    const chat = model.startChat({
      history: formattedHistory,
      // 3. UPDATED Generation Config: Allow more text and more "creativity"
      generationConfig: {
        maxOutputTokens: 800, // Increased from 200 to 1024 (allows longer texts)
        temperature: 0.7,       // Increased (0.9) for more personality and randomness
        topP: 0.9,
        topK: 40,
      },
    });

    const result = await chat.sendMessage(userMessage);
    const responseText = result.response.text();

    const updatedHistory = [
      ...history,
      { role: 'user', parts: userMessage } as IChatMessage,
      { role: 'model', parts: responseText } as IChatMessage
    ];

    // Keep last 20 messages
    const finalHistory = updatedHistory.slice(-20);

    session.history = finalHistory;
    await session.save();

    return responseText;

  } catch (error: any) {
    console.error("Gemini Service Error:", error.message);
    throw new Error("Failed to generate response from AI");
  }
};