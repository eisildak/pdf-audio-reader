import { OfflineTTS } from './offlineTts';
import { generateOptimizedSpeech } from './optimizedTts';

export enum TTSMode {
    OFFLINE_ONLY = 'offline',
    GEMINI_ONLY = 'gemini', 
    SMART_HYBRID = 'hybrid'
}

export class SmartTTSManager {
    private offlineTTS: OfflineTTS;
    private mode: TTSMode = TTSMode.SMART_HYBRID;
    private geminiUsageCount = 0;
    private maxGeminiUsage = 5; // Günlük Gemini limit

    constructor() {
        this.offlineTTS = new OfflineTTS();
        this.loadUsageFromStorage();
    }

    private loadUsageFromStorage() {
        const today = new Date().toDateString();
        const savedData = localStorage.getItem('tts-usage');
        
        if (savedData) {
            const data = JSON.parse(savedData);
            if (data.date === today) {
                this.geminiUsageCount = data.count || 0;
            } else {
                // Yeni gün - reset
                this.resetDailyUsage();
            }
        }
    }

    private saveDailyUsage() {
        const today = new Date().toDateString();
        localStorage.setItem('tts-usage', JSON.stringify({
            date: today,
            count: this.geminiUsageCount
        }));
    }

    private resetDailyUsage() {
        this.geminiUsageCount = 0;
        this.saveDailyUsage();
    }

    setMode(mode: TTSMode) {
        this.mode = mode;
        console.log(`🔧 TTS Modu değiştirildi: ${mode}`);
    }

    async speak(text: string): Promise<boolean> {
        console.log(`🎵 TTS İsteği (Mod: ${this.mode}, Gemini: ${this.geminiUsageCount}/${this.maxGeminiUsage})`);

        switch (this.mode) {
            case TTSMode.OFFLINE_ONLY:
                return await this.offlineTTS.speakOffline(text);

            case TTSMode.GEMINI_ONLY:
                if (this.geminiUsageCount >= this.maxGeminiUsage) {
                    console.warn('🚫 Günlük Gemini limiti aşıldı!');
                    return false;
                }
                return await this.useGemini(text);

            case TTSMode.SMART_HYBRID:
            default:
                // Akıllı seçim
                return await this.smartChoice(text);
        }
    }

    private async smartChoice(text: string): Promise<boolean> {
        // Kısa metinler için offline kullan
        if (text.length < 100) {
            console.log('📝 Kısa metin - Offline TTS');
            const offlineSuccess = await this.offlineTTS.speakOffline(text);
            if (offlineSuccess) return true;
        }

        // Gemini limiti kontrolü
        if (this.geminiUsageCount >= this.maxGeminiUsage) {
            console.warn('⚠️ Gemini limiti doldu, offline\'a geçiliyor');
            return await this.offlineTTS.speakOffline(text);
        }

        // Uzun metinler için Gemini (limit varsa)
        console.log('🤖 Uzun metin - Gemini TTS');
        return await this.useGemini(text);
    }

    private async useGemini(text: string): Promise<boolean> {
        try {
            const result = await generateOptimizedSpeech(text);
            
            if (result) {
                this.geminiUsageCount++;
                this.saveDailyUsage();
                console.log(`✅ Gemini başarılı (${this.geminiUsageCount}/${this.maxGeminiUsage})`);
                return true;
            }
            
            return false;
        } catch (error) {
            console.error('❌ Gemini hatası, offline\'a geçiliyor');
            return await this.offlineTTS.speakOffline(text);
        }
    }

    getStatus() {
        return {
            mode: this.mode,
            geminiUsage: `${this.geminiUsageCount}/${this.maxGeminiUsage}`,
            geminiRemaining: this.maxGeminiUsage - this.geminiUsageCount,
            offlineStatus: this.offlineTTS.getStatus()
        };
    }

    stop() {
        this.offlineTTS.stop();
    }
}