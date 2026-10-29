import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.routes.ts';
import eventRoutes from './routes/event.routes.ts';
import ticketRoutes from './routes/ticket.routes.ts';

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// Rute REST API
app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api', ticketRoutes);

app.get('/api/health', (req, res) => {
  res.json({ message: 'Backend Eventify SQLite aktif!' });
});

app.listen(PORT, () => {
  console.log(`🚀 Eventify Backend running at: http://localhost:${PORT}`);
});
