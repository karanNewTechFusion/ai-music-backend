
import express from 'express';
import {
  saveAudio,
  uploadAudioMiddleware,
  downloadAudio,
} from '../controllers/audioController.js';

const router = express.Router();

router.post('/save', uploadAudioMiddleware, saveAudio);
router.get('/download/:filename', downloadAudio); // <-- NEW route

export default router; 
