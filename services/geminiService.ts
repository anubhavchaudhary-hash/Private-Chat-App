// This service provides an AI response. To avoid requiring an API key in the browser
// we only instantiate the official `@google/genai` client if an API key is configured.
// Otherwise we return a safe, local fallback response so the app works without the key.

const API_KEY = process.env.API_KEY || process.env.GEMINI_API_KEY;

if (!API_KEY) {
    console.warn("Gemini API key not found. AI features will be disabled and a local fallback will be used.");
}

// Exported function: if API key exists, dynamically import and call the GenAI client.
// If not, return a harmless fallback string.
export const getAiResponse = async (prompt: string): Promise<string> => {
    if (!API_KEY) {
        // Local simulated response when no API key is configured.
        return `AI is disabled in this build. (Prompt received: "${prompt}")`;
    }

    try {
        // Dynamic import prevents bundlers from including the server-only client
        // into browser bundles unless the code path is used.
        const { GoogleGenAI } = await import('@google/genai');
        const ai = new GoogleGenAI({ apiKey: API_KEY });
        const model = 'gemini-2.5-flash';

        console.log(`Sending prompt to Gemini: "${prompt}"`);
        const response: any = await ai.models.generateContent({
            model: model,
            contents: `You are a helpful assistant in a chat app. Keep your response concise and conversational. User prompt: "${prompt}"`,
        });

        const text = response?.text ?? '';
        console.log(`Received response from Gemini: "${text}"`);
        return text;
    } catch (error) {
        console.error("Error calling Gemini API:", error);
        return "Sorry, I encountered an error while trying to respond.";
    }
};
