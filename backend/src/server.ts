import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.routes.ts';
import eventRoutes from './routes/event.routes.ts';
import ticketRoutes from './routes/ticket.routes.ts';

const app = express();
// Railway akan otomatis menyediakan PORT secara dinamis
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Rute REST API
app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api', ticketRoutes);

app.get('/api/health', (req, res) => {
  res.json({ message: 'Backend Eventify Online di Railway!' });
});

app.listen(PORT, () => {
  console.log(`🚀 Eventify Backend running at port: ${PORT}`);
});
