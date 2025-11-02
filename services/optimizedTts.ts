import { GoogleGenAI, Modality } from "@google/genai";

// Optimized TTS - Kota tasarrufu için
export async function generateOptimizedSpeech(text: string): Promise<string | null> {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    
    if (!apiKey) {
        console.error('API anahtarı bulunamadı!');
        return null;
    }

    // Metin uzunluğunu kontrol et ve sınırla
    const MAX_CHARS = 500; // API kotasını korumak için sınır
    if (text.length > MAX_CHARS) {
        console.warn(`Metin çok uzun (${text.length} karakter). İlk ${MAX_CHARS} karakter kullanılıyor.`);
        text = text.substring(0, MAX_CHARS) + "...";
    }

    // Gereksiz karakterleri temizle
    const cleanText = text
        .replace(/\s+/g, ' ') // Çoklu boşlukları tek boşluğa çevir
        .replace(/[^\w\s.,!?;:-]/g, '') // Gereksiz özel karakterleri kaldır
        .trim();

    if (cleanText.length === 0) {
        console.error('Temizlenen metin boş!');
        return null;
    }

    console.log(`🎵 TTS İsteği: ${cleanText.length} karakter`);

    try {
        const ai = new GoogleGenAI({ apiKey });
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash-preview-tts",
            contents: [{ parts: [{ text: cleanText }] }],
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
        
        if (base64Audio) {
            console.log('✅ TTS başarılı!');
            return base64Audio;
        } else {
            console.error('❌ TTS yanıtı boş');
            return null;
        }
    } catch (error: any) {
        if (error?.status === 429) {
            console.error('🚫 API Kotası aşıldı! Lütfen bekleyin veya yeni API key kullanın.');
        } else {
            console.error('❌ TTS Hatası:', error?.message || error);
        }
        return null;
    }
}

// Chunk-based TTS - Uzun metinler için
export async function generateChunkedSpeech(text: string): Promise<string[]> {
    const CHUNK_SIZE = 300; // Kota koruma
    const chunks: string[] = [];
    
    // Metni cümlelere böl
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    
    let currentChunk = '';
    const audioChunks: string[] = [];
    
    for (const sentence of sentences) {
        if ((currentChunk + sentence).length > CHUNK_SIZE) {
            // Mevcut chunk'ı işle
            if (currentChunk.trim()) {
                const audio = await generateOptimizedSpeech(currentChunk.trim());
                if (audio) {
                    audioChunks.push(audio);
                }
                // API rate limiting için kısa bekleme
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
            currentChunk = sentence.trim();
        } else {
            currentChunk += (currentChunk ? '. ' : '') + sentence.trim();
        }
    }
    
    // Son chunk'ı işle
    if (currentChunk.trim()) {
        const audio = await generateOptimizedSpeech(currentChunk.trim());
        if (audio) {
            audioChunks.push(audio);
        }
    }
    
    return audioChunks;
}

// Demo TTS - Test için minimal kullanım
export async function generateDemoSpeech(): Promise<string | null> {
    return await generateOptimizedSpeech("Bu bir test sesli okumasıdır. PDF Audio Reader çalışıyor.");
}