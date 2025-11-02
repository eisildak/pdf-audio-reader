// Offline TTS - Hiç API kullanmaz
export class OfflineTTS {
    private isSupported: boolean;
    private voices: SpeechSynthesisVoice[] = [];

    constructor() {
        this.isSupported = 'speechSynthesis' in globalThis;
        this.loadVoices();
    }

    private loadVoices() {
        if (!this.isSupported) return;

        const synthesis = globalThis.speechSynthesis;
        this.voices = synthesis.getVoices();
        
        // Voices yüklenmediyse event listener ekle
        if (this.voices.length === 0) {
            synthesis.onvoiceschanged = () => {
                this.voices = synthesis.getVoices();
                console.log(`🎵 ${this.voices.length} ses yüklendi`);
            };
        }
    }

    getTurkishVoice(): SpeechSynthesisVoice | null {
        return this.voices.find(voice => 
            voice.lang.startsWith('tr') || 
            voice.name.toLowerCase().includes('turkish') ||
            voice.name.toLowerCase().includes('zeynep') || // macOS Türkçe ses
            voice.name.toLowerCase().includes('yelda')    // Windows Türkçe ses
        ) || null;
    }

    async speakOffline(text: string): Promise<boolean> {
        if (!this.isSupported) {
            console.error('❌ Browser TTS desteklenmiyor');
            return false;
        }

        return new Promise((resolve) => {
            const synthesis = globalThis.speechSynthesis;
            
            // Kısa tutun - offline TTS için
            const shortText = text.length > 150 ? text.substring(0, 150) + "..." : text;
            
            const utterance = new SpeechSynthesisUtterance(shortText);
            
            // Türkçe ses varsa kullan
            const turkishVoice = this.getTurkishVoice();
            if (turkishVoice) {
                utterance.voice = turkishVoice;
                console.log('🇹🇷 Türkçe ses kullanılıyor:', turkishVoice.name);
            }
            
            utterance.rate = 0.9;
            utterance.pitch = 1;
            utterance.volume = 1;
            
            utterance.onend = () => {
                console.log('✅ Offline TTS tamamlandı');
                resolve(true);
            };
            
            utterance.onerror = () => {
                console.log('❌ Offline TTS hatası');
                resolve(false);
            };

            synthesis.speak(utterance);
        });
    }

    stop() {
        if (this.isSupported) {
            globalThis.speechSynthesis.cancel();
        }
    }

    getStatus() {
        return {
            supported: this.isSupported,
            voicesCount: this.voices.length,
            hasTurkish: !!this.getTurkishVoice(),
            turkishVoice: this.getTurkishVoice()?.name || 'Bulunamadı'
        };
    }
}