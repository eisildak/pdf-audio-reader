import { GoogleGenAI, Modality } from "@google/genai";

// Gelişmiş TTS fonksiyonu
export async function generateSimpleSpeech(text: string): Promise<string | null> {
    // Environment değişkenlerini kontrol et
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    
    if (!apiKey) {
        console.error('API anahtarı bulunamadı!');
        return null;
    }

    try {
        const ai = new GoogleGenAI({ apiKey });
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash-preview-tts",
            contents: [{ parts: [{ text: text }] }],
            config: {
                responseModalities: [Modality.AUDIO],
                speechConfig: {
                    voiceConfig: {
                        prebuiltVoiceConfig: { voiceName: 'Kore' },
                    },
                },
            },
        });
        
        const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        return base64Audio || null;
    } catch (error) {
        console.error('Ses oluşturma hatası:', error);
        return null;
    }
}