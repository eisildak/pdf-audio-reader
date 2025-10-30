# PDF Audio Reader - Netlify Deployment Guide

## 🚀 Deploy to Netlify

### Method 1: Automatic Deployment (Recommended)

1. **Push your code to GitHub:**
   ```bash
   git add .
   git commit -m "Prepare for Netlify deployment"
   git push origin develop
   ```

2. **Deploy on Netlify:**
   - Go to [Netlify](https://netlify.com)
   - Click "New site from Git"
   - Connect your GitHub account
   - Select this repository (`pdf-audio-reader`)
   - Choose the `develop` branch
   - Netlify will auto-detect the build settings from `netlify.toml`

3. **Set Environment Variables:**
   - In your Netlify dashboard, go to Site settings > Environment variables
   - Add: `VITE_GEMINI_API_KEY` = `YOUR_API_KEY`

### Method 2: Manual Build Upload

1. **Build the project locally:**
   ```bash
   npm run build
   ```

2. **Upload the `dist` folder to Netlify manually**

## 🔧 Configuration Files Created

- `netlify.toml` - Netlify build configuration
- `vite-env.d.ts` - TypeScript environment types
- Updated `vite.config.ts` - Environment variable handling
- Updated `services/geminiService.ts` - API key management

## 🔒 Security Notes

- Your API key is stored securely in Netlify environment variables
- `.env.local` is in `.gitignore` and won't be committed
- Environment variables are handled properly for both local and production

## 🌐 Features

- ✅ Single Page Application (SPA) routing
- ✅ Optimized build for production
- ✅ Secure API key handling
- ✅ TypeScript support
- ✅ Mobile responsive design

Your app will be available at: `https://your-site-name.netlify.app`