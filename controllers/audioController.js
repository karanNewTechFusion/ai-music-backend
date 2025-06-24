import multer from "multer";
import path from "path";
import fs from "fs";
import { v4 as uuidv4 } from "uuid";
import axios from "axios";
import ffmpeg from "fluent-ffmpeg";
import ffmpegInstaller from "@ffmpeg-installer/ffmpeg";
import { Readable } from "stream";
import { sendResponse } from "../utility/responseHelper.js";
import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";
import { decode } from "wav-decoder";
import { AMDF } from "pitchfinder";
import { std } from "mathjs";

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

ffmpeg.setFfmpegPath(ffmpegInstaller.path);
const storage = multer.memoryStorage();
const upload = multer({ storage });
export const uploadAudioMiddleware = upload.single("audio");

// 🔄 WebM → MP3
function convertToMp3(buffer) {
  return new Promise((resolve, reject) => {
    const readableStream = new Readable();
    readableStream.push(buffer);
    readableStream.push(null);

    const chunks = [];
    ffmpeg(readableStream)
      .inputFormat("webm")
      .audioCodec("libmp3lame")
      .format("mp3")
      .on("error", reject)
      .pipe()
      .on("data", (chunk) => chunks.push(chunk))
      .on("end", () => resolve(Buffer.concat(chunks)));
  });
}

// 🔄 MP3 → WAV
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

// 🔊 Extract mean volume in dB
function extractRMS(buffer) {
  return new Promise((resolve, reject) => {
    const tmpFile = `tmp-${uuidv4()}.mp3`;
    fs.writeFileSync(tmpFile, buffer);

    ffmpeg(tmpFile)
      .audioFilters("volumedetect")
      .format("null")
      .on("stderr", (stderrLine) => {
        const match = stderrLine.match(/mean_volume: ([-\d.]+) dB/);
        if (match) {
          resolve(parseFloat(match[1]));
        }
      })
      .on("end", () => fs.unlinkSync(tmpFile))
      .on("error", reject)
      .save(path.join(process.platform === "win32" ? "NUL" : "/dev/null"));
  });
}

// 🎼 Extract pitch
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
export const saveAudio = async (req, res) => {
  try {
    const { file } = req;
    const { title, user_id } = req.body;

    console.log("📥 Request Received =>", { title, user_id, hasFile: !!file });

    if (!file || !title || !user_id) {
      console.warn("❌ Missing fields: title, user_id, or audio file");
      return sendResponse(res, false, 400, "Missing required fields");
    }

    console.log("🔄 Converting WebM → MP3...");
    const mp3Buffer = await convertToMp3(file.buffer);
    console.log("✅ MP3 conversion done");

    const fileName = `${uuidv4()}.mp3`;
    console.log("📝 Generated filename:", fileName);

    console.log("☁️ Uploading to Supabase...");
    const { error: uploadError } = await supabase.storage
      .from("recordings")
      .upload(fileName, mp3Buffer, { contentType: "audio/mpeg" });

    if (uploadError) {
      console.error("❌ Upload failed:", uploadError);
      return sendResponse(res, false, 500, "Upload failed", {
        error: uploadError.message,
      });
    }

    const publicUrl = "DOWNLOAD LINK TEMPORARILY DISABLED DUE TO PERMISSION ISSUE";
    console.log("🔗 Supabase public URL placeholder:", publicUrl);

    console.log("📤 Inserting metadata...");
    const { error: insertError } = await supabase
      .from("audios")
      .insert([{ title, url: publicUrl, user_id }]);

    if (insertError) {
      console.error("❌ Metadata insert failed:", insertError);
      return sendResponse(res, false, 500, "Metadata save failed", {
        error: insertError.message,
      });
    }

    console.log("🔁 Converting MP3 → WAV...");
    const wavBuffer = await convertToWav(mp3Buffer);

    console.log("🎼 Extracting pitch...");
    const pitches = await decodePitch(wavBuffer);
    console.log("🎵 Total pitch points:", pitches.length);

    console.log("📊 Calculating stability (std deviation)...");
    const stability = std(pitches);
    console.log("✅ Stability (pitch std):", stability);

    console.log("🔊 Calculating projection (mean dB)...");
    const projection = await extractRMS(mp3Buffer);
    console.log("✅ Projection (volume):", projection, "dB");

    console.log("✅ All processing complete. Sending response...");

    return sendResponse(res, true, 200, "Audio uploaded & analyzed", {
      title,
      url: publicUrl,
      user_id,
      pitchData: pitches.slice(0, 100),
      stability,
      projection,
    });
  } catch (err) {
    console.error("❌ Internal error:", err);
    return sendResponse(res, false, 500, "Internal server error", {
      error: err.message,
    });
  }
};
























// working >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
// >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>.>>




// import multer from "multer";
// import path from "path";
// import { v4 as uuidv4 } from "uuid";
// import axios from "axios";
// import ffmpeg from "fluent-ffmpeg";
// import ffmpegInstaller from "@ffmpeg-installer/ffmpeg";
// import { Readable } from "stream";
// import { sendResponse } from "../utility/responseHelper.js";
// import dotenv from "dotenv";
// import { createClient } from "@supabase/supabase-js";
// dotenv.config();

// const supabase = createClient(
//   process.env.SUPABASE_URL,
//   process.env.SUPABASE_SERVICE_ROLE_KEY
// );

// ffmpeg.setFfmpegPath(ffmpegInstaller.path);

// // Multer memory storage
// const storage = multer.memoryStorage();
// const upload = multer({ storage });
// export const uploadAudioMiddleware = upload.single("audio");

// // Convert .webm buffer to .mp3
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
//       .on("error", (err) => reject(err))
//       .pipe()
//       .on("data", (chunk) => chunks.push(chunk))
//       .on("end", () => resolve(Buffer.concat(chunks)));
//   });
// }

// // ✅ Main saveAudio function
// export const saveAudio = async (req, res) => {
//   try {
//     const { file } = req;
//     const { title, user_id } = req.body;

//     console.log("==> Received saveAudio request");
//     console.log("Title:", title);
//     console.log("User ID:", user_id);
//     console.log("File Info:", file?.originalname, file?.mimetype, file?.size);

//     if (!file || !title || !user_id) {
//       console.log("❌ Missing required fields");
//       return sendResponse(
//         res,
//         false,
//         400,
//         "Audio file, title, and user ID are required"
//       );
//     }

//     const mp3Buffer = await convertToMp3(file.buffer);
//     console.log("✅ Audio converted to mp3 buffer");

//     const fileName = `${uuidv4()}.mp3`;
//     console.log("Generated filename:", fileName);

//     const { data: storageData, error: uploadError } = await supabase.storage
//       .from("recordings")
//       .upload(fileName, mp3Buffer, {
//         contentType: "audio/mpeg",
//       });

//     if (uploadError) {
//       console.log("❌ Upload error:", uploadError);
//       return sendResponse(res, false, 500, "Upload failed", {
//         error: uploadError.message,
//       });
//     }

//     const publicUrl = `${process.env.SUPABASE_URL}/storage/v1/object/public/recordings/${fileName}`;
//     console.log("✅ File uploaded. Public URL:", publicUrl);

//     // 👇 Log types for debugging RLS errors
//     console.log("📌 Types:", {
//       title: typeof title,
//       url: typeof publicUrl,
//       user_id: typeof user_id,
//     });
//     console.log("🧪 Insert attempt to audios table", {
//       title,
//       publicUrl,
//       user_id,
//     });

//     const { error: insertError, data: insertData } = await supabase
//       .from("audios")
//       .insert([{ title, url: publicUrl, user_id }]);

//     console.log("📥 Insert payload:", { title, url: publicUrl, user_id });
//     console.log("📥 Insert response:", insertData);
//     console.log("❌ Insert error object:", insertError);
//     console.log("🧪 Inserting audio metadata to Supabase:");
//     console.log({ title, url: publicUrl, user_id });
//     // console.log("🔑 Supabase key used (first 10 chars):", process.env.SUPABASE_KEY.slice(0, 10));

//     if (insertError) {
//       return sendResponse(res, false, 500, "Metadata save failed", {
//         error: insertError.message,
//       });
//     }

   

//     return sendResponse(res, true, 200, "Audio uploaded successfully", {
//       title,
//       url: publicUrl,
//       user_id,
//     });
//   } catch (err) {
//     console.error("error:", err);
//     return sendResponse(res, false, 500, "Internal server error", {
//       error: err.message,
//     });
//   }
// };

// export const downloadAudio = async (req, res) => {
//   const { filename } = req.params;

//   try {
//     const downloadUrl = `${process.env.SUPABASE_URL}/storage/v1/object/public/recordings/${filename}`;
//     const response = await axios.get(downloadUrl, { responseType: "stream" });

//     const fileBaseName = path.parse(filename).name;
//     const forcedFileName = `${fileBaseName}.mp3`;

//     res.setHeader("Content-Type", "audio/mpeg");
//     res.setHeader(
//       "Content-Disposition",
//       `attachment; filename="${forcedFileName}"`
//     );
//     return response.data.pipe(res);
//   } catch (error) {
//     return sendResponse(res, false, 500, "Failed to download audio", {
//       error: error.message,
//     });
//   }
// };
