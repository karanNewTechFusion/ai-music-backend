import express, { response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import userRoutes from './routes/userRoutes.js';
import audioRoutes from './routes/audioRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/users', userRoutes);
app.use('/audio', audioRoutes);
app.use('/', response.send('Welcome to the AI Music Backend!.....'));
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
