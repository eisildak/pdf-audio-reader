// Gemini API test fonksiyonu
export const testGeminiAPI = async () => {
    console.log('Testing Gemini API...');
    
    try {
        // Environment variable kontrol
        const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
        console.log('API Key found:', !!apiKey);
        console.log('API Key length:', apiKey?.length || 0);
        
        if (!apiKey) {
            console.error('No API key found!');
            return false;
        }

        // Basit fetch testi
        const testResponse = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=' + apiKey, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: "Say hello"
                    }]
                }]
            })
        });

        console.log('API Response status:', testResponse.status);
        
        if (testResponse.ok) {
            const data = await testResponse.json();
            console.log('API Test successful:', data);
            return true;
        } else {
            console.error('API Error:', testResponse.statusText);
            return false;
        }
        
    } catch (error) {
        console.error('API Test failed:', error);
        return false;
    }
};