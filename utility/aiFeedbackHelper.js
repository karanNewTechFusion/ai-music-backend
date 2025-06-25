import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export const generateSingingFeedback = async (stability, projection) => {
  const prompt = `
You're a professional vocal coach. Based on the following metrics:

- Pitch Stability: ${stability}
- Projection (mean volume in dB): ${projection}

First, evaluate their pitch stability — is it consistent or going off-key?
Then check their voice projection — is it weak, average, or strong?
Most importantly, point out exact lines or words where they made noticeable mistakes, such as going too fast, too slow, off-pitch, or unclear pronunciation.
Give line-by-line feedback like this example:
:musical_note: Line: "Ae mere hamsafar, ae mere jaane jaan, meri manzil hai tu, tu hi mera jahaan"
 :point_right: Feedback: "Jab aap 'jaane jaan' bolte ho, tab aapki speed thodi badh jaati hai aur clarity kam ho jaati hai. Aap is line ko thoda smoothly aur feel ke sath gaya karo, jisse emotion achhe se deliver ho."
Aisi har line ke liye point-wise suggest karo ki aapne yahan aisa kiya, aap yeh try karo to behtar hoga.
Always keep the tone friendly, beginner-friendly, and motivating. Use Hindi for the feedback and examples.
End with overall summary and motivation: "Aapka effort bohot achha tha, bas thoda sa practice karein pitch aur clarity pe — aap definitely improve karenge!`;

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
