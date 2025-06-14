# 🚀 Numa Health App - Deployment Guide

## Overview
Your Numa Health App is now ready to be deployed to a remote server! This guide covers multiple deployment options.

## 🌐 Deployment Options

### Option 1: Vercel (Recommended)
**Best for**: Easy deployment, great performance, free tier

1. **Install Vercel CLI**:
   ```bash
   npm install -g vercel
   ```

2. **Deploy**:
   ```bash
   vercel
   ```
   - Follow the prompts
   - Choose your project settings
   - Your app will be live at `https://your-project.vercel.app`

3. **Environment Variables**:
   - Go to your Vercel dashboard
   - Add your Firebase environment variables:
     - `API_KEY`
     - `AUTH_DOMAIN`
     - `PROJECT_ID`
     - `STORAGE_BUCKET`
     - `MESSAGING_SENDER_ID`
     - `APP_ID`

### Option 2: Netlify
**Best for**: Static sites, drag-and-drop deployment

1. **Method A - Drag & Drop**:
   - Run `npm run build:web`
   - Go to [netlify.com](https://netlify.com)
   - Drag the `dist` folder to deploy

2. **Method B - Git Integration**:
   - Connect your GitHub repository
   - Netlify will auto-deploy on commits

3. **Environment Variables**:
   - Go to Site Settings > Environment Variables
   - Add your Firebase config variables

### Option 3: Firebase Hosting
**Best for**: Integration with existing Firebase services

1. **Install Firebase CLI**:
   ```bash
   npm install -g firebase-tools
   ```

2. **Initialize Firebase Hosting**:
   ```bash
   firebase login
   firebase init hosting
   ```
   - Choose your existing Firebase project
   - Set public directory to `dist`
   - Configure as single-page app: Yes

3. **Deploy**:
   ```bash
   npm run build:web
   firebase deploy
   ```

## 🔧 Build Commands

- **Development**: `npm run web`
- **Build for production**: `npm run build:web`
- **Preview build**: `npm run preview`

## 🌍 Environment Variables

Make sure to set these in your deployment platform:

```
API_KEY=your_firebase_api_key
AUTH_DOMAIN=your_project.firebaseapp.com
PROJECT_ID=your_project_id
STORAGE_BUCKET=your_project.appspot.com
MESSAGING_SENDER_ID=your_sender_id
APP_ID=your_app_id
```

## 📱 Features Available on Web

✅ **Working Features**:
- User authentication (email/password)
- Profile creation and management
- Firebase integration
- Meal analysis (OpenAI integration)
- Recent meals display
- Responsive design

⚠️ **Limited Features**:
- Camera access (web cameras work differently)
- Biometric authentication (not available on web)
- Push notifications (different implementation needed)

## 🔄 Continuous Deployment

### GitHub Actions (Optional)
Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Vercel
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm install
      - run: npm run build:web
      - uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
```

## 🎯 Next Steps

1. **Choose your deployment platform**
2. **Set up environment variables**
3. **Deploy your app**
4. **Test all functionality**
5. **Set up custom domain (optional)**

## 🆘 Troubleshooting

### Common Issues:

1. **Environment Variables Not Working**:
   - Make sure they're set in your deployment platform
   - Check the exact variable names

2. **Firebase Connection Issues**:
   - Verify your Firebase config
   - Check Firebase project permissions

3. **Build Failures**:
   - Run `npm run build:web` locally first
   - Check for any console errors

## 📞 Support

If you encounter any issues, check:
1. Browser console for errors
2. Network tab for failed requests
3. Firebase console for authentication issues

Your app is ready to go live! 🎉 