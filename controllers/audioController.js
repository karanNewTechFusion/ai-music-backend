// // 📦 Dependencies
// import multer from "multer";
// import path from "path";
// import fs from "fs";
// import { v4 as uuidv4 } from "uuid";
// import axios from "axios";
// import ffmpeg from "fluent-ffmpeg";
// import ffmpegInstaller from "@ffmpeg-installer/ffmpeg";
// import { Readable } from "stream";
// import { sendResponse } from "../utility/responseHelper.js";
// import dotenv from "dotenv";
// import { decode } from "wav-decoder";
// import { AMDF } from "pitchfinder";
// import { std } from "mathjs";
// import { AudioModel } from "../models/AudioModel.js";
// import { uploadFileToStorage } from "../utility/storageHelper.js";

// dotenv.config();

// // 📍 Setup
// ffmpeg.setFfmpegPath(ffmpegInstaller.path);
// const storage = multer.memoryStorage();
// const upload = multer({ storage });
// export const uploadAudioMiddleware = upload.single("audio");

// // 🔄 WebM → MP3
// function convertToMp3(buffer) {
//   return new Promise((resolve, reject) => {
//     const readableStream = new Readable();
//     readableStream.push(buffer);
//     readableStream.push(null);

//     const chunks = [];
//     ffmpeg(readableStream)
//       .inputFormat("webm")
//       .audioCodec("libmp3lame")
//       .format("mp3")
//       .on("error", reject)
//       .pipe()
//       .on("data", (chunk) => chunks.push(chunk))
//       .on("end", () => resolve(Buffer.concat(chunks)));
//   });
// }

// // 🔄 MP3 → WAV
// function convertToWav(buffer) {
//   return new Promise((resolve, reject) => {
//     const tmpInput = `input-${uuidv4()}.mp3`;
//     const tmpOutput = `output-${uuidv4()}.wav`;
//     fs.writeFileSync(tmpInput, buffer);

//     ffmpeg(tmpInput)
//       .toFormat("wav")
//       .on("end", () => {
//         const wavBuffer = fs.readFileSync(tmpOutput);
//         fs.unlinkSync(tmpInput);
//         fs.unlinkSync(tmpOutput);
//         resolve(wavBuffer);
//       })
//       .on("error", reject)
//       .save(tmpOutput);
//   });
// }

// // 🔊 Extract mean volume in dB
// function extractRMS(buffer) {
//   return new Promise((resolve, reject) => {
//     const tmpFile = `tmp-${uuidv4()}.mp3`;
//     fs.writeFileSync(tmpFile, buffer);

//     ffmpeg(tmpFile)
//       .audioFilters("volumedetect")
//       .format("null")
//       .on("stderr", (stderrLine) => {
//         const match = stderrLine.match(/mean_volume: ([-\d.]+) dB/);
//         if (match) {
//           resolve(parseFloat(match[1]));
//         }
//       })
//       .on("end", () => fs.unlinkSync(tmpFile))
//       .on("error", reject)
//       .save(path.join(process.platform === "win32" ? "NUL" : "/dev/null"));
//   });
// }

// // 🎼 Extract pitch
// function decodePitch(wavBuffer) {
//   return decode(wavBuffer).then((audioData) => {
//     const channelData = audioData.channelData[0];
//     const detectPitch = AMDF();
//     const pitches = [];

//     for (let i = 0; i < channelData.length; i += 1024) {
//       const slice = channelData.slice(i, i + 1024);
//       const pitch = detectPitch(slice);
//       if (pitch) pitches.push(pitch);
//     }

//     return pitches;
//   });
// }

// // 🚀 Main controller
// export const saveAudio = async (req, res) => {
//   try {
//     const { file } = req;
//     const { title, user_id } = req.body;

//     if (!file || !title || !user_id) {
//       return sendResponse(res, false, 400, "Missing required fields");
//     }

//     const mp3Buffer = await convertToMp3(file.buffer);
//     const fileName = `${uuidv4()}.mp3`;

//     const fileUrl = await uploadFileToStorage(mp3Buffer, fileName);
//     if (!fileUrl) {
//       return sendResponse(res, false, 500, "Failed to upload file");
//     }

//     const wavBuffer = await convertToWav(mp3Buffer);
//     const pitches = await decodePitch(wavBuffer);
//     const stability = std(pitches);
//     const projection = await extractRMS(mp3Buffer);

//     const audioDoc = await AudioModel.create({
//       title,
//       url: fileUrl,
//       user_id,
//       pitchData: pitches.slice(0, 100),
//       stability,
//       projection,
//     });

//     return sendResponse(res, true, 200, "Audio uploaded & analyzed", audioDoc);
//   } catch (err) {
//     console.error("❌ Internal error:", err);
//     return sendResponse(res, false, 500, "Internal server error", {
//       error: err.message,
//     });
//   }
// };
