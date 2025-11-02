// Browser native TTS - Gemini gerektirmez
export class NativeTTS {
    private synthesis: SpeechSynthesis;
    private voice: SpeechSynthesisVoice | null = null;

    constructor() {
        this.synthesis = window.speechSynthesis;
        this.initVoice();
    }

    private initVoice() {
        const voices = this.synthesis.getVoices();
        
        // Türkçe ses ara
        this.voice = voices.find(voice => 
            voice.lang.includes('tr') || 
            voice.name.includes('Turkish') ||
            voice.name.includes('Türkçe')
        ) || voices[0] || null;

        console.log('🎵 Native TTS Voice:', this.voice?.name || 'Default');
    }

    async speak(text: string): Promise<void> {
        return new Promise((resolve, reject) => {
            if (!this.voice) {
                this.initVoice();
            }

            // Metin uzunluğunu sınırla
            const maxChars = 200;
            if (text.length > maxChars) {
                text = text.substring(0, maxChars) + "...";
            }

            const utterance = new SpeechSynthesisUtterance(text);
            
            if (this.voice) {
                utterance.voice = this.voice;
            }
            
            utterance.rate = 1.0;
            utterance.pitch = 1.0;
            utterance.volume = 1.0;

            utterance.onend = () => resolve();
            utterance.onerror = (error) => reject(error);

            this.synthesis.speak(utterance);
        });
    }

    stop() {
        this.synthesis.cancel();
    }

    pause() {
        this.synthesis.pause();
    }

    resume() {
        this.synthesis.resume();
    }

    getAvailableVoices(): SpeechSynthesisVoice[] {
        return this.synthesis.getVoices();
    }
}

// Hybrid çözüm: Önce native, başarısız olursa Gemini
export async function generateHybridSpeech(text: string): Promise<string | null> {
    console.log('🔄 Hybrid TTS: Native önce deneniyor...');
    
    try {
        const nativeTTS = new NativeTTS();
        await nativeTTS.speak(text);
        console.log('✅ Native TTS başarılı - Gemini kullanılmadı!');
        return 'native-success'; // Başarı işareti
    } catch (error) {
        console.log('⚠️ Native TTS başarısız, Gemini deneniyor...');
        
        // Fallback: Gemini kullan
        const { generateOptimizedSpeech } = await import('./optimizedTts');
        return await generateOptimizedSpeech(text);
    }
}