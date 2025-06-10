import express from 'express';
import mongoose from 'mongoose';
import issueRoutes from './api/issues.js';
import notifyRoutes from '../services/notificationService.js';

const app = express();
app.use(express.json());

mongoose.connect('mongodb://localhost:27017/issues', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

app.use('/api/issues', issueRoutes);
app.use('/api/notify', notifyRoutes);

app.listen(3000, () => console.log('Server running on http://localhost:3000'));
