import { GoogleGenAI } from "@google/genai";

export async function getChatResponse(message: string, madrasahInfo: string) {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: message,
    config: {
      systemInstruction: `You are a helpful assistant for "হাজ্বী ছৈয়দ আহমদ (রহ:) মাদ্রাসা কমপ্লেক্স" (Haji Sayed Ahmad (Rh.) Madrasah Complex). 
      Your goal is to provide accurate information about the Madrasah based on the following context:
      
      ${madrasahInfo}
      
      If you don't know the answer, politely ask the user to contact the Madrasah directly at 01822-326895 or 01783-861610.
      Always respond in the language the user uses (Bengali, English, or Arabic). 
      Be polite, respectful, and helpful. Use Islamic greetings where appropriate (e.g., Assalamu Alaikum).`,
    },
  });

  return response.text;
}
