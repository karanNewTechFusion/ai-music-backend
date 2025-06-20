import express, { response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import userRoutes from './routes/userRoutes.js';
import audioRoutes from './routes/audioRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// app.use(cors());
app.use(cors({
  origin: (origin, callback) => {
    callback(null, true); // Allow all origins
  },
  credentials: true, // Allow cookies/auth headers
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.get('/', (req, res) => {
  res.json({ message: 'API working ✅' });
});
app.use('/api/users', userRoutes);
app.use('/audio', audioRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
