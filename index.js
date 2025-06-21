import express, { response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import userRoutes from './routes/userRoutes.js';
import audioRoutes from './routes/audioRoutes.js';

dotenv.config();
console.log("✅ Supabase Key in use (first 20 chars):", process.env.SUPABASE_SERVICE_ROLE_KEY?.substring(0, 20));
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
