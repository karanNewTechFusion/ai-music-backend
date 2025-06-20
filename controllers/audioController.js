
// import multer from 'multer';
// import path from 'path';
// import { v4 as uuidv4 } from 'uuid';
// import supabase from '../services/supabaseClient.js';
// import axios from 'axios';
// import ffmpeg from 'fluent-ffmpeg';
// import ffmpegInstaller from '@ffmpeg-installer/ffmpeg';
// import { Readable } from 'stream';

// ffmpeg.setFfmpegPath(ffmpegInstaller.path);

// // Multer config for memory storage
// const storage = multer.memoryStorage();
// const upload = multer({ storage });
// export const uploadAudioMiddleware = upload.single('audio');

// // Convert .webm buffer to .mp3 using ffmpeg
// function convertToMp3(buffer) {
//   return new Promise((resolve, reject) => {
//     const readableStream = new Readable();
//     readableStream.push(buffer);
//     readableStream.push(null);

//     const chunks = [];

//     const ffmpegProcess = ffmpeg(readableStream)
//       .inputFormat('webm')
//       .audioCodec('libmp3lame')
//       .format('mp3')
//       .on('error', (err) => {
//         console.error('FFmpeg error:', err);
//         reject(err);
//       });

//     const outputStream = ffmpegProcess.pipe();

//     outputStream.on('data', (chunk) => chunks.push(chunk));
//     outputStream.on('end', () => resolve(Buffer.concat(chunks)));
//   });
// }

// // Save audio to Supabase in MP3 format
// export const saveAudio = async (req, res) => {
//   try {
//     const file = req.file;
//     const { title } = req.body;

//     if (!file || !title) {
//       return res.status(400).json({
//         success: false,
//         message: 'Audio file and title are required',
//       });
//     }

//     const mp3Buffer = await convertToMp3(file.buffer);
//     const fileName = `${uuidv4()}.mp3`;

//     const { data, error: uploadError } = await supabase.storage
//       .from('recordings')
//       .upload(fileName, mp3Buffer, {
//         contentType: 'audio/mpeg',
//       });

//     if (uploadError) {
//       return res.status(500).json({
//         success: false,
//         message: 'Upload failed',
//         error: uploadError.message,
//       });
//     }

//     const publicUrl = `${process.env.SUPABASE_URL}/storage/v1/object/public/recordings/${fileName}`;

//     const { error: insertError } = await supabase
//       .from('audios')
//       .insert([{ title, url: publicUrl }]);

//     if (insertError) {
//       return res.status(500).json({
//         success: false,
//         message: 'Metadata save failed',
//         error: insertError.message,
//       });
//     }

//     res.status(200).json({
//       success: true,
//       message: 'Audio uploaded successfully',
//       data: { title, url: publicUrl },
//     });
//   } catch (err) {
//     console.error('Upload error:', err);
//     res.status(500).json({
//       success: false,
//       message: 'Internal server error',
//       error: err.message,
//     });
//   }
// };

// // Download audio by filename (forces .mp3)
// export const downloadAudio = async (req, res) => {
//   const { filename } = req.params;

//   try {
//     const downloadUrl = `${process.env.SUPABASE_URL}/storage/v1/object/public/recordings/${filename}`;
//     const response = await axios.get(downloadUrl, { responseType: 'stream' });

//     const fileBaseName = path.parse(filename).name;
//     const forcedFileName = `${fileBaseName}.mp3`;

//     res.setHeader('Content-Type', 'audio/mpeg');
//     res.setHeader('Content-Disposition', `attachment; filename="${forcedFileName}"`);
//     response.data.pipe(res);
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: 'Failed to download audio',
//       error: error.message,
//     });
//   }
// };

// import multer from 'multer';
// import path from 'path';
// import { v4 as uuidv4 } from 'uuid';
// import supabase from '../services/supabaseClient.js';
// import axios from 'axios';
// import ffmpeg from 'fluent-ffmpeg';
// import ffmpegInstaller from '@ffmpeg-installer/ffmpeg';
// import { Readable } from 'stream';
// import { successResponse, errorResponse } from '../utils/responseHelper.js';

// ffmpeg.setFfmpegPath(ffmpegInstaller.path);

// // Multer memory storage
// const storage = multer.memoryStorage();
// const upload = multer({ storage });
// export const uploadAudioMiddleware = upload.single('audio');

// // Convert .webm buffer to .mp3
// function convertToMp3(buffer) {
//   return new Promise((resolve, reject) => {
//     const readableStream = new Readable();
//     readableStream.push(buffer);
//     readableStream.push(null);

//     const chunks = [];

//     ffmpeg(readableStream)
//       .inputFormat('webm')
//       .audioCodec('libmp3lame')
//       .format('mp3')
//       .on('error', (err) => reject(err))
//       .pipe()
//       .on('data', (chunk) => chunks.push(chunk))
//       .on('end', () => resolve(Buffer.concat(chunks)));
//   });
// }

// // Save audio
// export const saveAudio = async (req, res) => {
//   try {
//     const { file } = req;
//     const { title } = req.body;

//     if (!file || !title) {
//       return errorResponse(res, 400, 'Audio file and title are required');
//     }

//     const mp3Buffer = await convertToMp3(file.buffer);
//     const fileName = `${uuidv4()}.mp3`;

//     const { data, error: uploadError } = await supabase.storage
//       .from('recordings')
//       .upload(fileName, mp3Buffer, {
//         contentType: 'audio/mpeg',
//       });

//     if (uploadError) {
//       return errorResponse(res, 500, 'Upload failed', uploadError.message);
//     }

//     const publicUrl = `${process.env.SUPABASE_URL}/storage/v1/object/public/recordings/${fileName}`;

//     const { error: insertError } = await supabase
//       .from('audios')
//       .insert([{ title, url: publicUrl }]);

//     if (insertError) {
//       return errorResponse(res, 500, 'Metadata save failed', insertError.message);
//     }

//     return successResponse(res, 200, 'Audio uploaded successfully', {
//       title,
//       url: publicUrl,
//     });
//   } catch (err) {
//     return errorResponse(res, 500, 'Internal server error', err.message);
//   }
// };

// // Download audio
// export const downloadAudio = async (req, res) => {
//   const { filename } = req.params;

//   try {
//     const downloadUrl = `${process.env.SUPABASE_URL}/storage/v1/object/public/recordings/${filename}`;
//     const response = await axios.get(downloadUrl, { responseType: 'stream' });

//     const fileBaseName = path.parse(filename).name;
//     const forcedFileName = `${fileBaseName}.mp3`;

//     res.setHeader('Content-Type', 'audio/mpeg');
//     res.setHeader('Content-Disposition', `attachment; filename="${forcedFileName}"`);
//     return response.data.pipe(res);
//   } catch (error) {
//     return errorResponse(res, 500, 'Failed to download audio', error.message);
//   }
// };









// Save audio
// export const saveAudio = async (req, res) => {
//   try {
//     const { file } = req;
//     const { title, user_id } = req.body; // ✅ also get user_id from frontend
//     console.log("Request Body::::::::::::", req.body);


//     if (!file || !title || !user_id) {
//       return sendResponse(res, false, 400, 'Audio file, title, and user ID are required');
//     }

//     const mp3Buffer = await convertToMp3(file.buffer);
//     const fileName = `${uuidv4()}.mp3`;

//     const { data, error: uploadError } = await supabase.storage
//       .from('recordings')
//       .upload(fileName, mp3Buffer, {
//         contentType: 'audio/mpeg',
//       });

//     if (uploadError) {
//       return sendResponse(res, false, 500, 'Upload failed', { error: uploadError.message });
//     }

//     const publicUrl = `${process.env.SUPABASE_URL}/storage/v1/object/public/recordings/${fileName}`;

//     const { error: insertError } = await supabase
//       .from('audios')
//       .insert([{ title, url: publicUrl, user_id }]); // ✅ store user_id also

//     if (insertError) {
//       return sendResponse(res, false, 500, 'Metadata save failed', { error: insertError.message });
//     }

//     return sendResponse(res, true, 200, 'Audio uploaded successfully', {
//       title,
//       url: publicUrl,
//       user_id, // ✅ optional: return it back to frontend too
//     });
//   } catch (err) {
//     return sendResponse(res, false, 500, 'Internal server error', { error: err.message });
//   }
// };


// // Download audio
// export const downloadAudio = async (req, res) => {
//   const { filename } = req.params;

//   try {
//     const downloadUrl = `${process.env.SUPABASE_URL}/storage/v1/object/public/recordings/${filename}`;
//     const response = await axios.get(downloadUrl, { responseType: 'stream' });

//     const fileBaseName = path.parse(filename).name;
//     const forcedFileName = `${fileBaseName}.mp3`;

//     res.setHeader('Content-Type', 'audio/mpeg');
//     res.setHeader('Content-Disposition', `attachment; filename="${forcedFileName}"`);
//     return response.data.pipe(res);
//   } catch (error) {
//     return sendResponse(res, false, 500, 'Failed to download audio', {
//       error: error.message,
//     });
//   }
// };





























































// import multer from 'multer';
// import path from 'path';
// import { v4 as uuidv4 } from 'uuid';
// import supabase from '../services/supabaseClient.js';
// import axios from 'axios';
// import ffmpeg from 'fluent-ffmpeg';
// import ffmpegInstaller from '@ffmpeg-installer/ffmpeg';
// import { Readable } from 'stream';
// import { sendResponse } from '../utility/responseHelper.js';

// ffmpeg.setFfmpegPath(ffmpegInstaller.path);

// // Multer memory storage
// const storage = multer.memoryStorage();
// const upload = multer({ storage });
//  const uploadAudioMiddleware = upload.single('audio');

// // Convert .webm buffer to .mp3
// function convertToMp3(buffer) {
//   return new Promise((resolve, reject) => {
//     const readableStream = new Readable();
//     readableStream.push(buffer);
//     readableStream.push(null);

//     const chunks = [];

//     ffmpeg(readableStream)
//       .inputFormat('webm')
//       .audioCodec('libmp3lame')
//       .format('mp3')
//       .on('error', (err) => reject(err))
//       .pipe()
//       .on('data', (chunk) => chunks.push(chunk))
//       .on('end', () => resolve(Buffer.concat(chunks)));
//   });
// }

// const saveAudio = async (req, res) => {
//   try {
//     const { file } = req;
//     const { title, user_id } = req.body;

//     console.log("==> Received saveAudio request");
//     console.log("Title:", title);
//     console.log("User ID:", user_id);
//     console.log("File Info:", file?.originalname, file?.mimetype, file?.size);

//     if (!file || !title || !user_id) {
//       console.log("❌ Missing required fields");
//       return sendResponse(res, false, 400, 'Audio file, title, and user ID are required');
//     }

//     const mp3Buffer = await convertToMp3(file.buffer);
//     console.log("✅ Audio converted to mp3 buffer");

//     const fileName = `${uuidv4()}.mp3`;
//     console.log("Generated filename:", fileName);

//     const { data, error: uploadError } = await supabase.storage
//       .from('recordings')
//       .upload(fileName, mp3Buffer, {
//         contentType: 'audio/mpeg',
//       });

//     if (uploadError) {
//       console.log("❌ Upload error:", uploadError.message);
//       return sendResponse(res, false, 500, 'Upload failed', { error: uploadError.message });
//     }

//     const publicUrl = `${process.env.SUPABASE_URL}/storage/v1/object/public/recordings/${fileName}`;
//     console.log("✅ File uploaded. Public URL:", publicUrl);

//     const { error: insertError } = await supabase
//       .from('audios')
//       .insert([{ title, url: publicUrl, user_id }]);

//     if (insertError) {
//       console.log("❌ Insert error:", insertError.message);
//       return sendResponse(res, false, 500, 'Metadata save failed', { error: insertError.message });
//     }

//     console.log("✅ Audio metadata saved to Supabase");

//     return sendResponse(res, true, 200, 'Audio uploaded successfully', {
//       title,
//       url: publicUrl,
//       user_id,
//     });
//   } catch (err) {
//     console.error("🔥 saveAudio catch block error:", err);
//     return sendResponse(res, false, 500, 'Internal server error', { error: err.message });
//   }
// };


// // ✅ Enable this part
//  const downloadAudio = async (req, res) => {
//   const { filename } = req.params;

//   try {
//     const downloadUrl = `${process.env.SUPABASE_URL}/storage/v1/object/public/recordings/${filename}`;
//     const response = await axios.get(downloadUrl, { responseType: 'stream' });

//     const fileBaseName = path.parse(filename).name;
//     const forcedFileName = `${fileBaseName}.mp3`;

//     res.setHeader('Content-Type', 'audio/mpeg');
//     res.setHeader('Content-Disposition', `attachment; filename="${forcedFileName}"`);
//     return response.data.pipe(res);
//   } catch (error) {
//     return sendResponse(res, false, 500, 'Failed to download audio', {
//       error: error.message,
//     });
//   }
// };



// export { uploadAudioMiddleware, saveAudio, downloadAudio };








import multer from 'multer';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
// import supabase from '../services/supabaseClient.js';
import axios from 'axios';
import ffmpeg from 'fluent-ffmpeg';
import ffmpegInstaller from '@ffmpeg-installer/ffmpeg';
import { Readable } from 'stream';
import { sendResponse } from '../utility/responseHelper.js';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
);

ffmpeg.setFfmpegPath(ffmpegInstaller.path);

// Multer memory storage
const storage = multer.memoryStorage();
const upload = multer({ storage });
export const uploadAudioMiddleware = upload.single('audio');

// Convert .webm buffer to .mp3
function convertToMp3(buffer) {
  return new Promise((resolve, reject) => {
    const readableStream = new Readable();
    readableStream.push(buffer);
    readableStream.push(null);

    const chunks = [];

    ffmpeg(readableStream)
      .inputFormat('webm')
      .audioCodec('libmp3lame')
      .format('mp3')
      .on('error', (err) => reject(err))
      .pipe()
      .on('data', (chunk) => chunks.push(chunk))
      .on('end', () => resolve(Buffer.concat(chunks)));
  });
}

// ✅ Main saveAudio function
export const saveAudio = async (req, res) => {
  try {
    const { file } = req;
    const { title, user_id } = req.body;

    console.log("==> Received saveAudio request");
    console.log("Title:", title);
    console.log("User ID:", user_id);
    console.log("File Info:", file?.originalname, file?.mimetype, file?.size);

    if (!file || !title || !user_id) {
      console.log("❌ Missing required fields");
      return sendResponse(res, false, 400, 'Audio file, title, and user ID are required');
    }

    const mp3Buffer = await convertToMp3(file.buffer);
    console.log("✅ Audio converted to mp3 buffer");

    const fileName = `${uuidv4()}.mp3`;
    console.log("Generated filename:", fileName);

    const { data: storageData, error: uploadError } = await supabase.storage
      .from('recordings')
      .upload(fileName, mp3Buffer, {
        contentType: 'audio/mpeg',
      });

    if (uploadError) {
      console.log("❌ Upload error:", uploadError);
      return sendResponse(res, false, 500, 'Upload failed', { error: uploadError.message });
    }

    const publicUrl = `${process.env.SUPABASE_URL}/storage/v1/object/public/recordings/${fileName}`;
    console.log("✅ File uploaded. Public URL:", publicUrl);

    // 👇 Log types for debugging RLS errors
    console.log("📌 Types:", {
      title: typeof title,
      url: typeof publicUrl,
      user_id: typeof user_id,
    });
console.log("🧪 Insert attempt to audios table", { title, publicUrl, user_id });

    const { error: insertError, data: insertData } = await supabase
      .from('audios')
      .insert([{ title, url: publicUrl, user_id }]);

    console.log("📥 Insert payload:", { title, url: publicUrl, user_id });
    console.log("📥 Insert response:", insertData);
    console.log("❌ Insert error object:", insertError);
    console.log("🧪 Inserting audio metadata to Supabase:");
console.log({ title, url: publicUrl, user_id });
// console.log("🔑 Supabase key used (first 10 chars):", process.env.SUPABASE_KEY.slice(0, 10));

    if (insertError) {
      return sendResponse(res, false, 500, 'Metadata save failed', { error: insertError.message });
    }

    console.log("✅ Audio metadata saved to Supabase");

    return sendResponse(res, true, 200, 'Audio uploaded successfully', {
      title,
      url: publicUrl,
      user_id,
    });
  } catch (err) {
    console.error("🔥 saveAudio catch block error:", err);
    return sendResponse(res, false, 500, 'Internal server error', { error: err.message });
  }
};

// ✅ downloadAudio
export const downloadAudio = async (req, res) => {
  const { filename } = req.params;

  try {
    const downloadUrl = `${process.env.SUPABASE_URL}/storage/v1/object/public/recordings/${filename}`;
    const response = await axios.get(downloadUrl, { responseType: 'stream' });

    const fileBaseName = path.parse(filename).name;
    const forcedFileName = `${fileBaseName}.mp3`;

    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Content-Disposition', `attachment; filename="${forcedFileName}"`);
    return response.data.pipe(res);
  } catch (error) {
    return sendResponse(res, false, 500, 'Failed to download audio', {
      error: error.message,
    });
  }
};
