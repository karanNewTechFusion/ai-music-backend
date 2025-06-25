import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// 🧠 Upload buffer to Cloudinary (audio, images, etc.)
export const uploadFileToStorage = async (buffer, fileName) => {
  try {
    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          resource_type: "raw", // can be "video", "image", or "auto" too
          public_id: `audio/${fileName}`, // stores inside /audio folder
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );

      stream.end(buffer);
    });

    return result.secure_url;
  } catch (err) {
    console.error("❌ Cloudinary upload failed:", err);
    return null;
  }
};
