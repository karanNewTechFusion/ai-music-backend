
// import multer from 'multer';
// import path from 'path';
// import { v4 as uuidv4 } from 'uuid';
// import supabase from '../services/supabaseClient.js';
// import axios from 'axios';
// import ffmpeg from 'fluent-ffmpeg';
// import ffmpegInstaller from '@ffmpeg-installer/ffmpeg';
// import { Readable } from 'stream';
// ffmpeg.setFfmpegPath(ffmpegInstaller.path);
// // Multer config
// const storage = multer.memoryStorage();
// const upload = multer({ storage });

// export const uploadAudioMiddleware = upload.single('audio');

// export const saveAudio = async (req, res) => {
//   try {
//     console.log('Received request body:', req.body);
//     console.log('Received file:', req.file);

//     const file = req.file;
//     const { title } = req.body;

//     if (!file || !title) {
//       console.log('Missing file or title');
//       return res.status(400).json({ success: false, message: 'Audio file and title are required' });
//     }

//     const ext = path.extname(file.originalname);
//     const fileName = `${uuidv4()}${ext}`;

//     console.log('Uploading file with name:', fileName);

//     const { data, error: uploadError } = await supabase.storage
//       .from('recordings')
//       .upload(fileName, file.buffer, {
//         contentType: file.mimetype,
//       });

//     if (uploadError) {
//       console.log('Upload error:', uploadError);
//       return res.status(500).json({ success: false, message: 'Upload failed', error: uploadError.message });
//     }

//     const publicUrl = `${process.env.SUPABASE_URL}/storage/v1/object/public/recordings/${fileName}`;
//     console.log('File uploaded successfully, public URL:', publicUrl);

//     const { error: insertError } = await supabase
//       .from('audios')
//       .insert([{ title, url: publicUrl }]);

//     if (insertError) {
//       console.log('Insert error:', insertError);
//       return res.status(500).json({ success: false, message: 'Metadata save failed', error: insertError.message });
//     }

//     res.status(200).json({
//       success: true,
//       message: 'Audio uploaded successfully',
//       data: { title, url: publicUrl }
//     });
//   } catch (err) {
//     console.log('Catch error:', err);
//     res.status(500).json({ success: false, message: 'Internal server error', error: err.message });
//   }
// };


// export const downloadAudio = async (req, res) => {
//   const { filename } = req.params;

//   try {
//     // Construct download URL from Supabase
//     const downloadUrl = `${process.env.SUPABASE_URL}/storage/v1/object/public/recordings/${filename}`;
    
//     // Make request to Supabase public file
//     const response = await axios.get(downloadUrl, { responseType: 'stream' });

//     // Force file extension to `.mp3` regardless of original name
//     const fileBaseName = path.parse(filename).name;
//     const forcedFileName = `${fileBaseName}.mp3`;

//     res.setHeader('Content-Type', 'audio/mpeg'); // force MIME
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

// // export const downloadAudio = async (req, res) => {
// //   const { filename } = req.params;

// //   try {
// //     const downloadUrl = `${process.env.SUPABASE_URL}/storage/v1/object/public/recordings/${filename}`;
// //     const response = await axios.get(downloadUrl, { responseType: 'stream' });

// //     res.setHeader('Content-Type', response.headers['content-type']);
// //     res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
// //     response.data.pipe(res);
// //   } catch (error) {
// //     res.status(500).json({
// //       success: false,
// //       message: 'Failed to download audio',
// //       error: error.message,
// //     });
// //   }
// // };








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
//       .on('data', (chunk) => chunks.push(chunk))
//       .on('end', () => resolve(Buffer.concat(chunks)))
//       .on('error', reject)
//       .run();
//   });
// }









// import multer from 'multer';
// import path from 'path';
// import { v4 as uuidv4 } from 'uuid';
// import supabase from '../services/supabaseClient.js';
// import axios from 'axios';
// import ffmpeg from 'fluent-ffmpeg';
// import ffmpegInstaller from '@ffmpeg-installer/ffmpeg';
// import { Readable } from 'stream';

// ffmpeg.setFfmpegPath(ffmpegInstaller.path);

// // Multer config
// const storage = multer.memoryStorage();
// const upload = multer({ storage });
// export const uploadAudioMiddleware = upload.single('audio');

// // Convert .webm buffer to .mp3 buffer
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
//       .on('data', (chunk) => chunks.push(chunk))
//       .on('end', () => resolve(Buffer.concat(chunks)))
//       .on('error', reject)
//       .run();
//   });
// }

// // Save audio to Supabase in MP3 format
// export const saveAudio = async (req, res) => {
//   try {
//     const file = req.file;
//     const { title } = req.body;

//     if (!file || !title) {
//       return res.status(400).json({ success: false, message: 'Audio file and title are required' });
//     }

//     const mp3Buffer = await convertToMp3(file.buffer);
//     const fileName = `${uuidv4()}.mp3`;

//     const { data, error: uploadError } = await supabase.storage
//       .from('recordings')
//       .upload(fileName, mp3Buffer, {
//         contentType: 'audio/mpeg',
//       });

//     if (uploadError) {
//       return res.status(500).json({ success: false, message: 'Upload failed', error: uploadError.message });
//     }

//     const publicUrl = `${process.env.SUPABASE_URL}/storage/v1/object/public/recordings/${fileName}`;

//     const { error: insertError } = await supabase
//       .from('audios')
//       .insert([{ title, url: publicUrl }]);

//     if (insertError) {
//       return res.status(500).json({ success: false, message: 'Metadata save failed', error: insertError.message });
//     }

//     res.status(200).json({
//       success: true,
//       message: 'Audio uploaded successfully',
//       data: { title, url: publicUrl },
//     });
//   } catch (err) {
//     console.error('Upload error:', err);
//     res.status(500).json({ success: false, message: 'Internal server error', error: err.message });
//   }
// };

// // Force download as MP3
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






















import multer from 'multer';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import supabase from '../services/supabaseClient.js';
import axios from 'axios';
import ffmpeg from 'fluent-ffmpeg';
import ffmpegInstaller from '@ffmpeg-installer/ffmpeg';
import { Readable } from 'stream';

ffmpeg.setFfmpegPath(ffmpegInstaller.path);

// Multer config for memory storage
const storage = multer.memoryStorage();
const upload = multer({ storage });
export const uploadAudioMiddleware = upload.single('audio');

// Convert .webm buffer to .mp3 using ffmpeg
function convertToMp3(buffer) {
  return new Promise((resolve, reject) => {
    const readableStream = new Readable();
    readableStream.push(buffer);
    readableStream.push(null);

    const chunks = [];

    const ffmpegProcess = ffmpeg(readableStream)
      .inputFormat('webm')
      .audioCodec('libmp3lame')
      .format('mp3')
      .on('error', (err) => {
        console.error('FFmpeg error:', err);
        reject(err);
      });

    const outputStream = ffmpegProcess.pipe();

    outputStream.on('data', (chunk) => chunks.push(chunk));
    outputStream.on('end', () => resolve(Buffer.concat(chunks)));
  });
}

// Save audio to Supabase in MP3 format
export const saveAudio = async (req, res) => {
  try {
    const file = req.file;
    const { title } = req.body;

    if (!file || !title) {
      return res.status(400).json({
        success: false,
        message: 'Audio file and title are required',
      });
    }

    const mp3Buffer = await convertToMp3(file.buffer);
    const fileName = `${uuidv4()}.mp3`;

    const { data, error: uploadError } = await supabase.storage
      .from('recordings')
      .upload(fileName, mp3Buffer, {
        contentType: 'audio/mpeg',
      });

    if (uploadError) {
      return res.status(500).json({
        success: false,
        message: 'Upload failed',
        error: uploadError.message,
      });
    }

    const publicUrl = `${process.env.SUPABASE_URL}/storage/v1/object/public/recordings/${fileName}`;

    const { error: insertError } = await supabase
      .from('audios')
      .insert([{ title, url: publicUrl }]);

    if (insertError) {
      return res.status(500).json({
        success: false,
        message: 'Metadata save failed',
        error: insertError.message,
      });
    }

    res.status(200).json({
      success: true,
      message: 'Audio uploaded successfully',
      data: { title, url: publicUrl },
    });
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: err.message,
    });
  }
};

// Download audio by filename (forces .mp3)
export const downloadAudio = async (req, res) => {
  const { filename } = req.params;

  try {
    const downloadUrl = `${process.env.SUPABASE_URL}/storage/v1/object/public/recordings/${filename}`;
    const response = await axios.get(downloadUrl, { responseType: 'stream' });

    const fileBaseName = path.parse(filename).name;
    const forcedFileName = `${fileBaseName}.mp3`;

    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Content-Disposition', `attachment; filename="${forcedFileName}"`);
    response.data.pipe(res);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to download audio',
      error: error.message,
    });
  }
};

