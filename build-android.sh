#!/bin/bash

# Twin City Updates - Android Build Script
echo "🚀 Building Twin City Updates for Android..."

# Check if .env exists
if [ ! -f ".env" ]; then
    echo "❌ .env file not found! Creating template..."
    cat > .env << EOF
# Firebase Configuration
EXPO_PUBLIC_FIREBASE_API_KEY=your_api_key_here
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
EXPO_PUBLIC_FIREBASE_APP_ID=your_app_id
EXPO_PUBLIC_GOOGLE_CLIENT_ID=your_client_id
EOF
    echo "⚠️  Please update .env with your actual Firebase configuration!"
    exit 1
fi

# Build web version first
echo "📦 Building web version..."
npm run build:web

# Sync with Capacitor
echo "🔄 Syncing with Capacitor..."
npx cap sync

# Build Android APK
echo "🤖 Building Android APK..."
npx eas build --platform android --profile preview

echo "✅ Build complete! Check the EAS dashboard for your APK."
