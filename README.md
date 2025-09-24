# Twin City Updates

A React Native mobile application that aggregates local news and updates from multiple official sources including WhatsApp Business API, Twitter, and Facebook.

## Features

### ✅ Implemented Features
- **Multi-source News Feed**: Displays updates from WhatsApp Business, Twitter, and Facebook
- **Real-time Search**: Search through updates by keywords, titles, or authors
- **Source Filtering**: Filter updates by specific platforms (All, WhatsApp, Twitter, Facebook)
- **Pull-to-Refresh**: Refresh the feed by pulling down
- **Offline Mode**: Cache the latest 20 updates for offline viewing
- **Dark Mode**: Complete dark/light theme support with smooth transitions
- **Auto-refresh**: Automatically refresh content at configurable intervals
- **Professional UI**: Modern card-based design with smooth animations
- **Settings Management**: Comprehensive settings with persistent preferences
- **Cache Management**: View cache size and clear cached data
- **Responsive Design**: Optimized for both iOS and Android

### 🔧 Technical Features
- **Context API State Management**: Centralized app state management
- **AsyncStorage Integration**: Persistent storage for preferences and offline data
- **Mock API Integration**: Ready-to-connect API service layer
- **TypeScript**: Full type safety throughout the application
- **Expo Router**: File-based navigation system
- **Performance Optimized**: Efficient rendering and memory management

## Tech Stack

- **React Native** with Expo SDK 52
- **TypeScript** for type safety
- **Expo Router** for navigation
- **AsyncStorage** for local data persistence
- **Axios** for API calls
- **Context API** for state management
- **Lucide React Native** for icons

## Project Structure

```
app/
├── (tabs)/
│   ├── _layout.tsx          # Tab navigation configuration
│   ├── index.tsx            # Home screen with news feed
│   └── settings.tsx         # Settings screen
├── _layout.tsx              # Root layout with providers
└── +not-found.tsx           # 404 screen

components/
├── UpdateCard.tsx           # News update card component
└── SearchBar.tsx            # Search input component

contexts/
└── AppContext.tsx           # Global state management

services/
├── apiService.ts            # API integration layer
└── storageService.ts        # Local storage management

hooks/
└── useFrameworkReady.ts     # Framework initialization hook
```

## API Integration

The app is designed to integrate with three main APIs:

### 1. WhatsApp Business API
```typescript
// Example integration in apiService.ts
async fetchWhatsAppUpdates(): Promise<SocialUpdate[]> {
  const response = await axios.get(`${this.baseUrl}/whatsapp/messages`, {
    headers: {
      'Authorization': `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
      'Content-Type': 'application/json',
    },
  });
  return this.transformWhatsAppData(response.data);
}
```

### 2. Twitter API v2
```typescript
// Example integration in apiService.ts
async fetchTwitterUpdates(): Promise<SocialUpdate[]> {
  const response = await axios.get(`${this.baseUrl}/twitter/tweets`, {
    headers: {
      'Authorization': `Bearer ${TWITTER_BEARER_TOKEN}`,
      'Content-Type': 'application/json',
    },
    params: {
      'tweet.fields': 'created_at,public_metrics,attachments',
      'user.fields': 'username,name',
      'expansions': 'author_id,attachments.media_keys',
    },
  });
  return this.transformTwitterData(response.data);
}
```

### 3. Facebook Graph API
```typescript
// Example integration in apiService.ts
async fetchFacebookUpdates(): Promise<SocialUpdate[]> {
  const response = await axios.get(`${this.baseUrl}/facebook/posts`, {
    headers: {
      'Authorization': `Bearer ${FACEBOOK_ACCESS_TOKEN}`,
      'Content-Type': 'application/json',
    },
    params: {
      'fields': 'id,message,created_time,attachments,likes.summary(true),shares',
    },
  });
  return this.transformFacebookData(response.data);
}
```

## Setup Instructions

### Prerequisites
- Node.js 18+ 
- Expo CLI
- iOS Simulator (for iOS development)
- Android Studio/Emulator (for Android development)

### Installation

1. **Clone and install dependencies**:
```bash
npm install
```

2. **Start the development server**:
```bash
npm run dev
```

3. **Run on devices**:
   - **iOS**: Press `i` in the terminal or scan QR code with Camera app
   - **Android**: Press `a` in the terminal or scan QR code with Expo Go app
   - **Web**: Press `w` in the terminal

### API Configuration

To connect with real APIs, you'll need to:

1. **Get API Keys**:
   - WhatsApp Business API: Register at [Facebook Developers](https://developers.facebook.com/)
   - Twitter API: Apply at [Twitter Developer Portal](https://developer.twitter.com/)
   - Facebook Graph API: Create app at [Facebook Developers](https://developers.facebook.com/)

2. **Update API Service**:
   - Replace mock data in `services/apiService.ts`
   - Add your API endpoints and authentication tokens
   - Implement proper data transformation functions

3. **Environment Variables**:
   Create a `.env` file:
   ```
   WHATSAPP_ACCESS_TOKEN=your_whatsapp_token
   TWITTER_BEARER_TOKEN=your_twitter_token
   FACEBOOK_ACCESS_TOKEN=your_facebook_token
   API_BASE_URL=your_api_base_url
   ```

## Key Components

### UpdateCard Component
Displays individual news updates with:
- Source identification (icon and name)
- Timestamp formatting
- Media support (images, videos, links)
- Engagement metrics (likes, shares)
- Dark mode support

### SearchBar Component
Provides real-time search functionality with:
- Animated focus states
- Clear button
- Dark mode support
- Debounced search input

### AppContext
Manages global application state including:
- News updates and filtering
- User preferences
- Offline/online status
- Loading and refresh states

## Customization

### Theming
The app supports comprehensive theming through the preferences system:
- Light/Dark mode toggle
- Consistent color scheme
- Smooth theme transitions

### Refresh Intervals
Auto-refresh can be configured in settings:
- 1, 5, 15, 30 minutes, or disabled
- Respects offline mode
- Battery-efficient implementation

### Cache Management
Offline functionality includes:
- Automatic caching of latest 20 updates
- Cache size monitoring
- Manual cache clearing
- Graceful offline/online transitions

## Performance Considerations

- **Lazy Loading**: Updates are loaded efficiently
- **Image Optimization**: Remote images are cached and optimized
- **Memory Management**: Proper cleanup of subscriptions and timers
- **Battery Efficiency**: Smart refresh intervals and background handling

## Future Enhancements

- Push notifications for breaking news
- Update detail screens with full content
- Social sharing functionality
- Advanced filtering options (date range, keywords)
- User authentication and personalization
- Analytics and usage tracking

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test on both iOS and Android
5. Submit a pull request

## License

This project is licensed under the MIT License.