// Test için basit bir ses dosyası
export const testAudio = () => {
    console.log('Test audio function called');
    
    // Web Audio API test
    try {
        const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
        const audioContext = new AudioContext();
        
        console.log('AudioContext created, state:', audioContext.state);
        
        // Basit bir sine wave oluştur (test için)
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = 440; // A note
        gainNode.gain.value = 0.1; // Düşük ses seviyesi
        
        oscillator.start();
        setTimeout(() => {
            oscillator.stop();
            console.log('Test audio completed');
        }, 500); // 0.5 saniye çal
        
        return true;
    } catch (error) {
        console.error('Audio test failed:', error);
        return false;
    }
};