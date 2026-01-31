import express from 'express';
import cors from 'cors';
import chatRoutes from './routes/chatRoutes';

const app = express();

// Middleware
app.use(cors()); 
app.use(express.json());

// Routes
app.use('/api/chat', chatRoutes);

// Health check
app.get('/', (req, res) => {
  res.send('AI Girlfriend API is running 🚀');
});

export default app;