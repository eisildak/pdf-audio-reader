# 🎧 PDF Audio Reader

<div align="center">

**Yapay zekanın sizin için herhangi bir PDF makalesini okumasına izin verin**

[![Netlify Status](https://api.netlify.com/api/v1/badges/your-site-id/deploy-status)](https://app.netlify.com/sites/your-site-name/deploys)
[![React](https://img.shields.io/badge/React-19.2.0-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8.2-blue.svg)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.2.0-646CFF.svg)](https://vitejs.dev/)
[![Gemini AI](https://img.shields.io/badge/Gemini%20AI-TTS-4285F4.svg)](https://ai.google.dev/)

</div>

## ✨ Özellikler

- 📄 **PDF Yükleme**: PDF dosyalarını sürükle-bırak veya tıklayarak yükle
- 🎵 **AI Sesli Okuma**: Google Gemini AI ile doğal ses sentezi
- ⏯️ **Oynatma Kontrolleri**: Play, Pause, Stop, Next paragraph
- 🎛️ **Hız Kontrolü**: 0.5x ile 2x arasında okuma hızı ayarlama
- 🎯 **Metin Seçimi**: Herhangi bir metni seçerek oradan başlatma
- 📱 **Mobil Uyumlu**: iOS ve Android cihazlarda çalışır
- 🌙 **Dark Mode**: Göz dostu karanlık tema
- 🚀 **PWA Ready**: Progressive Web App desteği

## 🛠️ Teknolojiler

- **Frontend**: React 19 + TypeScript
- **Build Tool**: Vite 6
- **Styling**: Tailwind CSS
- **AI**: Google Gemini 2.5 Flash TTS
- **PDF Parser**: PDF.js
- **Audio**: Web Audio API
- **Deployment**: Netlify

## 🚀 Hızlı Başlangıç

### Gereksinimler

- Node.js 18 veya üzeri
- Google Gemini API anahtarı

### Kurulum

1. **Repository'yi klonlayın:**
   ```bash
   git clone https://github.com/eisildak/pdf-audio-reader.git
   cd pdf-audio-reader
   ```

2. **Bağımlılıkları yükleyin:**
   ```bash
   npm install
   ```

3. **Environment variables'ı ayarlayın:**
   ```bash
   # .env.local dosyası oluşturun ve API anahtarınızı ekleyin
   echo "VITE_GEMINI_API_KEY=your-gemini-api-key" > .env.local
   ```

4. **Geliştirme sunucusunu başlatın:**
   ```bash
   npm run dev
   ```

5. **Tarayıcınızda açın:** http://localhost:3000

## 🔑 API Anahtarı Alma

1. [Google AI Studio](https://makersuite.google.com/app/apikey) adresine gidin
2. Google hesabınızla giriş yapın
3. "Create API Key" butonuna tıklayın
4. API anahtarınızı kopyalayın ve `.env.local` dosyasına ekleyin

## 📱 Kullanım

### Masaüstü
1. PDF dosyanızı yükleme alanına sürükleyin veya tıklayın
2. Dosya işlendikten sonra ▶️ butonuna basın
3. AI metni okumaya başlayacak

### Mobil (iOS/Android)
1. Safari veya Chrome'da siteyi açın
2. PDF yükleyin
3. Play butonuna basın (iOS'ta ses için izin gerekli)

### Kontroller
- ▶️ **Play/Pause**: Okumayı başlat/duraklat
- ⏹️ **Stop**: Durdurup başa dön
- ⏭️ **Next**: Sonraki paragrafa geç
- 🎛️ **Speed**: Okuma hızını ayarla
- 🎯 **Text Selection**: Metin seç → "Seçimden Başla"

## 🌐 Netlify'a Deploy

### Otomatik Deployment

1. **GitHub'a push edin:**
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **Netlify'da site oluşturun:**
   - [Netlify](https://netlify.com) → "New site from Git"
   - GitHub repository'nizi seçin
   - Build ayarları otomatik algılanacak

3. **Environment variables ekleyin:**
   ```
   VITE_GEMINI_API_KEY = your-api-key
   ```

### Manuel Build

```bash
npm run build
# dist/ klasörünü Netlify'a upload edin
```

## 🔧 Geliştirme

### Proje Yapısı

```
pdf-audio-reader/
├── src/
│   ├── services/           # API servisleri
│   │   ├── geminiService.ts    # Gemini AI TTS
│   │   └── pdfService.ts       # PDF text extraction
│   ├── utils/             # Yardımcı fonksiyonlar
│   │   ├── audioUtils.ts      # Audio processing
│   │   └── textUtils.ts       # Text processing
│   ├── App.tsx            # Ana component
│   ├── types.ts           # TypeScript types
│   └── index.tsx          # Entry point
├── public/                # Static files
├── netlify.toml          # Netlify config
├── vite.config.ts        # Vite config
└── package.json          # Dependencies
```

### Build Commands

```bash
npm run dev      # Development server
npm run build    # Production build
npm run preview  # Preview production build
```

## 🔒 Güvenlik

- API anahtarları `.env.local` dosyasında saklanır
- `.gitignore` ile repository'e commit edilmez
- Netlify environment variables ile güvenli deployment
- HTTPS over Netlify

## 🐛 Sorun Giderme

### iOS'ta Ses Çıkmıyor
- Safari ayarları → Otomatik oynatma → İzin ver
- Sessize modu kapatın
- Play butonuna basılı tutup bırakın

### Build Hataları
```bash
# Cache temizle
rm -rf node_modules package-lock.json
npm install

# Environment kontrol
echo $VITE_GEMINI_API_KEY
```

### PDF Yüklenmiyor
- Dosya boyutu 10MB altında mı?
- PDF korumalı değil mi?
- Tarayıcı console'da hata var mı?

## 🤝 Katkıda Bulunma

1. Fork edin
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Commit edin (`git commit -m 'Add amazing feature'`)
4. Push edin (`git push origin feature/amazing-feature`)
5. Pull Request açın

## 📄 Lisans

Bu proje MIT lisansı altında lisanslanmıştır. Detaylar için [LICENSE](LICENSE) dosyasına bakın.

## 🙏 Teşekkürler

- [Google Gemini AI](https://ai.google.dev/) - Text-to-Speech API
- [PDF.js](https://mozilla.github.io/pdf.js/) - PDF processing
- [React](https://reactjs.org/) - UI framework
- [Tailwind CSS](https://tailwindcss.com/) - Styling
- [Vite](https://vitejs.dev/) - Build tool
- [Netlify](https://netlify.com/) - Hosting

---

<div align="center">

**⭐ Bu projeyi beğendiyseniz yıldızlamayı unutmayın!**

</div>
