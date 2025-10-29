# 🔑 Environment Variables Setup Guide

## Problem Solved
This guide fixes the issue where the production APK shows old mock data instead of fetching real news from APIs.

## Root Cause
When building the APK, environment variables (`EXPO_PUBLIC_NEWS_API_KEY`, `EXPO_PUBLIC_GNEWS_API_KEY`) were not included in the production build, causing the app to fall back to mock data with outdated timestamps.

## Solution: Setting Up Environment Variables

### Option 1: Using EAS Secrets (Recommended for Production)

EAS Secrets allow you to securely store API keys without committing them to your repository.

#### Step 1: Set Secrets via EAS CLI
```bash
# Login to EAS if not already logged in
npx eas login

# Set News API key
npx eas secret:create --scope project --name EXPO_PUBLIC_NEWS_API_KEY --value your_newsapi_key_here --type string

# Set GNews API key
npx eas secret:create --scope project --name EXPO_PUBLIC_GNEWS_API_KEY --value your_gnews_api_key_here --type string

# Set Weather API key (optional)
npx eas secret:create --scope project --name EXPO_PUBLIC_WEATHER_API_KEY --value your_weather_api_key_here --type string
```

#### Step 2: Verify Secrets
EAS automatically injects secrets as environment variables during the build. No changes to `eas.json` are needed - secrets are automatically available if they match the `EXPO_PUBLIC_*` naming pattern.

#### Step 3: Build with EAS
```bash
# Build preview
npx eas build --platform android --profile preview

# Build production
npx eas build --platform android --profile production
```

### Option 2: Using .env File (For Local Development)

For local development and testing:

#### Step 1: Create .env file in project root
```env
# News API Keys
EXPO_PUBLIC_NEWS_API_KEY=your_newsapi_key_here
EXPO_PUBLIC_GNEWS_API_KEY=your_gnews_api_key_here
EXPO_PUBLIC_WEATHER_API_KEY=your_weather_api_key_here

# Firebase Configuration
EXPO_PUBLIC_FIREBASE_API_KEY=your_api_key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
EXPO_PUBLIC_FIREBASE_APP_ID=your_app_id
EXPO_PUBLIC_GOOGLE_CLIENT_ID=your_client_id
```

#### Step 2: Install dotenv support (if needed)
```bash
npm install --save-dev @expo/config-plugins
```

#### Step 3: Use .env for local development
```bash
# Start development server (reads .env automatically)
npx expo start
```

### Option 3: Manual Environment Variables in eas.json

You can also manually set environment variables in `eas.json` for each build profile:

**Note:** This is less secure as it exposes keys in the config file. Only use for testing or if you're using a private repository.

```json
{
  "build": {
    "production": {
      "env": {
        "EXPO_PUBLIC_NEWS_API_KEY": "your_actual_key",
        "EXPO_PUBLIC_GNEWS_API_KEY": "your_actual_key"
      }
    }
  }
}
```

## Verifying Environment Variables in Production

After building and installing the APK, check the logs to verify API keys are loaded:

1. Connect your Android device via USB
2. Enable USB debugging
3. Run: `adb logcat | grep -E "NewsService|ApiService"`

You should see logs like:
```
[NewsService] API Keys Status: { hasNewsAPI: true, hasGNews: true }
[NewsService] Fetching from NewsAPI...
[ApiService] Successfully fetched X real news articles
```

If you see:
```
[NewsService] NewsAPI key not configured
[ApiService] No API keys configured and no real news data - using mock data
```

This means the environment variables were not included in the build.

## Getting API Keys

### NewsAPI.org
1. Sign up at https://newsapi.org/
2. Get your free API key (limited to 100 requests/day)
3. Copy the API key

### GNews API
1. Sign up at https://gnews.io/
2. Get your free API key (limited requests based on plan)
3. Copy the API key

### Weather API (OpenWeatherMap)
1. Sign up at https://openweathermap.org/api
2. Get your free API key
3. Copy the API key

## Troubleshooting

### Issue: Still seeing mock data in production APK

**Check 1:** Verify secrets are set
```bash
npx eas secret:list --scope project
```

**Check 2:** Rebuild the app after setting secrets
```bash
npx eas build --platform android --profile production --clear-cache
```

**Check 3:** Check device logs (see "Verifying Environment Variables" above)

### Issue: Environment variables work in development but not in production

- Make sure you've set EAS secrets (Option 1), not just .env file
- .env files are NOT included in production builds
- Only `EXPO_PUBLIC_*` variables prefixed are included in builds

### Issue: Getting API authentication errors

- Verify your API keys are correct
- Check API rate limits (free tiers have daily limits)
- Ensure API keys haven't expired

## Important Notes

1. **Never commit API keys** to your repository
2. **.env file should be in .gitignore** (already configured)
3. **Use EAS Secrets** for production builds
4. **Restart Expo** after adding/changing .env variables
5. **Clear build cache** if variables aren't updating: `eas build --clear-cache`

## Quick Checklist for Production Build

- [ ] Set EAS secrets for all required API keys
- [ ] Verify secrets with `npx eas secret:list`
- [ ] Build with `npx eas build --platform android --profile production`
- [ ] Test APK and check logs for API key status
- [ ] Verify news is being fetched from APIs (not mock data)

