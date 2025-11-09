import { GoogleGenAI } from "@google/genai";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
    console.warn("Gemini API key not found. AI features will be disabled.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY! });
const model = 'gemini-2.5-flash';

export const getAiResponse = async (prompt: string): Promise<string> => {
    if (!API_KEY) {
        return "AI feature is disabled. Please configure your API key.";
    }
    
    try {
        console.log(`Sending prompt to Gemini: "${prompt}"`);
        const response = await ai.models.generateContent({
            model: model,
            contents: `You are a helpful assistant in a chat app. Keep your response concise and conversational. User prompt: "${prompt}"`,
        });

        const text = response.text;
        console.log(`Received response from Gemini: "${text}"`);
        return text;
    } catch (error) {
        console.error("Error calling Gemini API:", error);
        return "Sorry, I encountered an error while trying to respond.";
    }
};
