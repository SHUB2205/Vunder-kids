# Fisiko Mobile App (Expo)

A sports social networking mobile app built with Expo React Native.

## Features

- **Instagram-style posting** - Share photos and videos
- **Stories** - 24-hour disappearing content
- **Reels** - Short-form video content
- **Profile** - User profiles with followers/following
- **Search** - Find users, news, and sports
- **Matches** - Create and join sports matches
- **Set Score** - Track match scores
- **Facility Booking** - Book sports facilities
- **AI Assistant** - Context-aware sports advice
- **Real-time Chat** - Private messaging with Socket.IO
- **Push Notifications** - Stay updated

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)
- iOS Simulator (Mac) or Android Emulator

### Installation

```bash
cd frontend
npm install
```

### Running the App

```bash
# Start Expo development server
npm start

# Run on iOS
npm run ios

# Run on Android
npm run android
```

### Configuration

Update `src/config/api.js` with your backend URLs:

```javascript
const API_BASE_URL = 'http://your-backend-url:5000/api';
const CHAT_BASE_URL = 'http://your-backend-url:4000';
```

## Project Structure

```
frontend/
├── App.js                 # App entry point
├── app.json              # Expo configuration
├── assets/               # Images, icons, fonts
├── src/
│   ├── components/       # Reusable components
│   ├── config/           # API and theme configuration
│   ├── context/          # React Context providers
│   ├── navigation/       # Navigation setup
│   └── screens/          # Screen components
│       ├── Auth/         # Login, Register
│       ├── Onboarding/   # User setup flow
│       ├── Home/         # Feed, Posts, Stories
│       ├── Search/       # Search functionality
│       ├── Reels/        # Video reels
│       ├── Matches/      # Sports matches
│       ├── Profile/      # User profiles
│       ├── Facilities/   # Facility booking
│       ├── Messages/     # Chat
│       ├── Notifications/# Notifications
│       └── AI/           # AI Assistant
```

## Building for Production

### iOS

```bash
expo build:ios
# or with EAS
eas build --platform ios
```

### Android

```bash
expo build:android
# or with EAS
eas build --platform android
```

## Tech Stack

- **Expo** - React Native framework
- **React Navigation** - Navigation
- **Axios** - HTTP client
- **Socket.IO** - Real-time communication
- **Expo AV** - Audio/Video playback
- **Expo Image Picker** - Media selection
- **Expo Notifications** - Push notifications
