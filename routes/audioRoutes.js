import express from "express";
import {
  saveAudio,
  analyzeTempAudio,         // 👈 New controller
  uploadAudioMiddleware,
} from "../controllers/audioController.js";

const router = express.Router();

// 🔄 Step 1: Temporary analysis (used before saving)
router.post("/analyze-temp", uploadAudioMiddleware, analyzeTempAudio);

// 💾 Step 2: Save only after user agrees
router.post("/save", uploadAudioMiddleware, saveAudio);

export default router;
