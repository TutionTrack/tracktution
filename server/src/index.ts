import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { sequelize } from './db';

import authRoutes from './routes/auth';
import studentRoutes from './routes/students';
import sessionRoutes from './routes/sessions';
import logRoutes from './routes/logs';
import reportRoutes from './routes/reports';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/logs', logRoutes);
app.use('/api/reports', reportRoutes);

import path from 'path';
// Serve static frontend files
app.use(express.static(path.join(__dirname, '../../client/dist')));
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../../client/dist/index.html'));
});

const PORT = process.env.PORT || 3000;

sequelize.sync({ alter: true })
  .then(() => {
    console.log('Database synced successfully');
  })
  .catch((err) => {
    console.error('Database connection failed:', err);
  });

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
