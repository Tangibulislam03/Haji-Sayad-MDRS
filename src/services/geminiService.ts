import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function getChatResponse(message: string, madrasahInfo: string) {
  const model = ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: message,
    config: {
      systemInstruction: `You are a helpful assistant for "হাজ্বী ছৈয়দ আহমদ (রহ:) মাদ্রাসা কমপ্লেক্স" (Haji Sayed Ahmad (Rh.) Madrasah Complex). 
      Your goal is to provide accurate information about the Madrasah based on the following context:
      
      ${madrasahInfo}
      
      If you don't know the answer, politely ask the user to contact the Madrasah directly at 01822-326895 or 01783-861610.
      Always respond in Bengali unless the user asks in English. Be polite and respectful.`,
    },
  });

  const response = await model;
  return response.text;
}
