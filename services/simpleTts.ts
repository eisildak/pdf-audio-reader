import { GoogleGenAI, Modality } from "@google/genai";

// Basit TTS test fonksiyonu
export async function generateSimpleSpeech(text: string): Promise<string | null> {
    console.log('🎵 generateSimpleSpeech called with:', text.substring(0, 50) + '...');
    
    // Environment değişkenlerini kontrol et
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    console.log('🔑 API Key check:', {
        found: !!apiKey,
        length: apiKey?.length || 0,
        firstChars: apiKey ? apiKey.substring(0, 10) + '...' : 'none'
    });
    
    if (!apiKey) {
        console.error('❌ No API key found!');
        alert('API anahtarı bulunamadı! .env.local dosyasını kontrol edin.');
        return null;
    }

    try {
        console.log('🚀 Creating GoogleGenAI client...');
        const ai = new GoogleGenAI({ apiKey });

        console.log('📡 Sending request to Gemini API...');
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
        
        console.log('📥 API Response received:', !!response);
        
        const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        
        if (base64Audio) {
            console.log('✅ Audio data received, length:', base64Audio.length);
            return base64Audio;
        } else {
            console.error('❌ No audio data in response');
            console.log('Response structure:', JSON.stringify(response, null, 2));
            return null;
        }
    } catch (error) {
        console.error('💥 Gemini API Error:', error);
        
        // Hata türüne göre kullanıcı dostu mesajlar
        if (error instanceof Error) {
            if (error.message.includes('API key')) {
                alert('API anahtarı geçersiz! Lütfen doğru anahtarı kontrol edin.');
            } else if (error.message.includes('quota')) {
                alert('API kotası aşıldı! Daha sonra tekrar deneyin.');
            } else if (error.message.includes('network')) {
                alert('İnternet bağlantısı sorunu! Bağlantınızı kontrol edin.');
            } else {
                alert('Ses oluşturma hatası: ' + error.message);
            }
        }
        
        return null;
    }
}