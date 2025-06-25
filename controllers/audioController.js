import multer from "multer";
import fs from "fs";
import { v4 as uuidv4 } from "uuid";
import ffmpeg from "fluent-ffmpeg";
import ffmpegInstaller from "@ffmpeg-installer/ffmpeg";
import { Readable } from "stream";
import { decode } from "wav-decoder";
import { AMDF } from "pitchfinder";
import { std } from "mathjs";
import { sendResponse } from "../utility/responseHelper.js";
import dotenv from "dotenv";
import Audio from "../models/AudioModel.js";
import { uploadFileToStorage } from "../utility/storageHelper.js";

dotenv.config();

// Setup
ffmpeg.setFfmpegPath(ffmpegInstaller.path);
const storage = multer.memoryStorage();
const upload = multer({ storage });
export const uploadAudioMiddleware = upload.single("audio");

// Convert WebM to MP3
function convertToMp3(buffer) {
  return new Promise((resolve, reject) => {
    const stream = new Readable();
    stream.push(buffer);
    stream.push(null);

    const chunks = [];
    ffmpeg(stream)
      .inputFormat("webm")
      .audioCodec("libmp3lame")
      .format("mp3")
      .on("error", reject)
      .pipe()
      .on("data", (chunk) => chunks.push(chunk))
      .on("end", () => resolve(Buffer.concat(chunks)));
  });
}

// Convert MP3 to WAV
function convertToWav(buffer) {
  return new Promise((resolve, reject) => {
    const tmpInput = `input-${uuidv4()}.mp3`;
    const tmpOutput = `output-${uuidv4()}.wav`;
    fs.writeFileSync(tmpInput, buffer);

    ffmpeg(tmpInput)
      .toFormat("wav")
      .on("end", () => {
        const wavBuffer = fs.readFileSync(tmpOutput);
        fs.unlinkSync(tmpInput);
        fs.unlinkSync(tmpOutput);
        resolve(wavBuffer);
      })
      .on("error", reject)
      .save(tmpOutput);
  });
}

// Extract RMS volume
function extractRMS(buffer) {
  return new Promise((resolve, reject) => {
    const tmpFile = `tmp-${uuidv4()}.mp3`;
    fs.writeFileSync(tmpFile, buffer);

    ffmpeg(tmpFile)
      .audioFilters("volumedetect")
      .format("null")
      .on("stderr", (line) => {
        const match = line.match(/mean_volume: ([-\d.]+) dB/);
        if (match) {
          resolve(parseFloat(match[1]));
        }
      })
      .on("end", () => fs.unlinkSync(tmpFile))
      .on("error", reject)
      .save(process.platform === "win32" ? "NUL" : "/dev/null");
  });
}

// Decode pitch
function decodePitch(wavBuffer) {
  return decode(wavBuffer).then((audioData) => {
    const channelData = audioData.channelData[0];
    const detectPitch = AMDF();
    const pitches = [];

    for (let i = 0; i < channelData.length; i += 1024) {
      const slice = channelData.slice(i, i + 1024);
      const pitch = detectPitch(slice);
      if (pitch) pitches.push(pitch);
    }

    return pitches;
  });
}

// 🚀 Main controller
export const finalizeAndSaveAudio = async (req, res) => {
  try {
    const { file } = req;
    const { title, user_id } = req.body;

    if (!file || !title || !user_id) {
      return sendResponse(res, false, 400, "Missing required fields");
    }

    const mp3Buffer = await convertToMp3(file.buffer);
    const fileName = `${uuidv4()}.mp3`;
    const fileUrl = await uploadFileToStorage(mp3Buffer, fileName);

    if (!fileUrl) {
      return sendResponse(res, false, 500, "Failed to upload audio file");
    }

    const wavBuffer = await convertToWav(mp3Buffer);
    const pitches = await decodePitch(wavBuffer);
    const stability = std(pitches);
    const projection = await extractRMS(mp3Buffer);

    const audioDoc = await Audio.create({
      title,
      url: fileUrl,
      user_id,
      pitchData: pitches.slice(0, 100),
      stability,
      projection,
    });

    return sendResponse(res, true, 200, "Audio uploaded & analyzed", audioDoc);
  } catch (err) {
    console.error("❌ Audio processing failed:", err);
    return sendResponse(res, false, 500, "Internal server error", {
      error: err.message,
    });
  }
};









// 🔍 Temporary audio analysis API – No save, only analysis
export const analyzeTempAudio = async (req, res) => {
  try {
    const { file } = req;

    if (!file) {
      return sendResponse(res, false, 400, "Audio file is required");
    }

    const mp3Buffer = await convertToMp3(file.buffer);
    const wavBuffer = await convertToWav(mp3Buffer);
    const pitches = await decodePitch(wavBuffer);
    const stability = std(pitches);
    const projection = await extractRMS(mp3Buffer);

    // 🧠 Add OpenAI feedback here (stubbed for now)
    const aiFeedback = `Your pitch is ${Math.round(stability)} stable. Try articulating clearer.`

    return sendResponse(res, true, 200, "Temporary analysis completed", {
      pitchData: pitches.slice(0, 100),
      stability,
      projection,
      aiFeedback,
      previewAudio: mp3Buffer.toString('base64'), // Optional: send preview for client-side audio playback
    });
  } catch (err) {
    console.error("❌ Temp audio analysis failed:", err);
    return sendResponse(res, false, 500, "Internal error", { error: err.message });
  }
};
