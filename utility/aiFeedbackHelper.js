import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export const generateSingingFeedback = async (stability, projection) => {
  const prompt = `
You're a professional vocal coach. Based on the following metrics:

- Pitch Stability: ${stability}
- Projection (mean volume in dB): ${projection}

Give friendly, constructive feedback to the user to help them improve their singing. Mention if their pitch is stable or needs work, and if their projection is weak, average, or strong. Keep the tone positive and beginner-friendly.`;

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text().trim();
  } catch (error) {
    console.error("❌ Gemini feedback error:", error);
    return "Could not generate feedback right now. Please try again.";
  }
};
