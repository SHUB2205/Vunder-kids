# Fisiko Backend Setup Guide

## Environment Variables

Create a `.env` file in the `backend` folder with the following variables:

```env
# Server
PORT=5000
CHAT_PORT=4000

# Database
MONGO_URI=mongodb://localhost:27017/fisiko

# JWT Authentication
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRES_IN=7d

# Cloudinary (Image/Video Uploads)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# OpenAI (AI Assistant)
OPENAI_API_KEY=sk-your_openai_api_key

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback

# Apple Sign In (iOS only)
APPLE_CLIENT_ID=com.yourcompany.fisiko
APPLE_TEAM_ID=YOUR_TEAM_ID
APPLE_KEY_ID=YOUR_KEY_ID
APPLE_PRIVATE_KEY_PATH=./keys/AuthKey.p8
```

---

## Setup Instructions

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Start MongoDB

Make sure MongoDB is running locally:

```bash
# Windows (if installed as service)
net start MongoDB

# Or start manually
mongod --dbpath "C:\data\db"

# Mac/Linux
mongod
```

### 3. Start the Backend

```bash
# Development mode (with auto-reload)
npm run dev

# Production mode
npm start
```

---

## Google OAuth Setup

### Step 1: Create Google Cloud Project
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable the **Google+ API** and **Google Identity** services

### Step 2: Create OAuth Credentials
1. Go to **APIs & Services** → **Credentials**
2. Click **Create Credentials** → **OAuth 2.0 Client IDs**
3. Configure the OAuth consent screen first if prompted
4. For Application type:
   - **Web application** for backend
   - **iOS** for iOS app
   - **Android** for Android app

### Step 3: Configure for Expo/React Native
1. Create an **iOS** OAuth client:
   - Bundle ID: `com.yourcompany.fisiko`
2. Create an **Android** OAuth client:
   - Package name: `com.yourcompany.fisiko`
   - SHA-1 certificate fingerprint (get from `expo credentials:manager`)
3. Create a **Web** OAuth client for backend verification

### Step 4: Get Your Credentials
Copy the **Client ID** and **Client Secret** to your `.env` file:
```env
GOOGLE_CLIENT_ID=123456789-abcdefg.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-your_secret_here
```

### Step 5: Install Expo Google Auth (Frontend)
```bash
cd frontend
npx expo install expo-auth-session expo-crypto expo-web-browser
```

---

## Apple Sign In Setup

### Prerequisites
- Apple Developer Account ($99/year)
- Mac with Xcode (for iOS development)

### Step 1: Enable Sign In with Apple
1. Go to [Apple Developer Portal](https://developer.apple.com/)
2. Go to **Certificates, Identifiers & Profiles**
3. Select your App ID or create a new one
4. Enable **Sign In with Apple** capability

### Step 2: Create a Service ID (for backend verification)
1. Go to **Identifiers** → **+** → **Services IDs**
2. Register a new Service ID (e.g., `com.yourcompany.fisiko.service`)
3. Enable **Sign In with Apple**
4. Configure domains and return URLs:
   - Domain: `yourdomain.com` (or `localhost` for testing)
   - Return URL: `http://localhost:5000/api/auth/apple/callback`

### Step 3: Create a Key for Server-to-Server Communication
1. Go to **Keys** → **+**
2. Register a new key with **Sign In with Apple** enabled
3. Download the `.p8` file (you can only download it once!)
4. Note the **Key ID**

### Step 4: Configure Backend
1. Create a `keys` folder in your backend:
   ```bash
   mkdir backend/keys
   ```
2. Move the `.p8` file to `backend/keys/AuthKey.p8`
3. Update your `.env`:
   ```env
   APPLE_CLIENT_ID=com.yourcompany.fisiko.service
   APPLE_TEAM_ID=YOUR_TEAM_ID  # Found in Apple Developer account
   APPLE_KEY_ID=YOUR_KEY_ID    # From the key you created
   APPLE_PRIVATE_KEY_PATH=./keys/AuthKey.p8
   ```

### Step 5: Install Expo Apple Auth (Frontend)
```bash
cd frontend
npx expo install expo-apple-authentication
```

### Step 6: Configure app.json for iOS
Add to your `frontend/app.json`:
```json
{
  "expo": {
    "ios": {
      "bundleIdentifier": "com.yourcompany.fisiko",
      "usesAppleSignIn": true
    }
  }
}
```

---

## Cloudinary Setup

1. Create account at [cloudinary.com](https://cloudinary.com/)
2. Go to Dashboard and copy:
   - Cloud Name
   - API Key
   - API Secret
3. Add to `.env`:
   ```env
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=123456789012345
   CLOUDINARY_API_SECRET=abcdefghijklmnopqrstuvwxyz
   ```

---

## OpenAI Setup

1. Create account at [platform.openai.com](https://platform.openai.com/)
2. Go to **API Keys** → **Create new secret key**
3. Add to `.env`:
   ```env
   OPENAI_API_KEY=sk-proj-your_api_key_here
   ```

---

## Quick Start Commands

```bash
# Backend
cd backend
cp .env.example .env  # Then edit .env with your values
npm install
npm run dev

# Frontend (in another terminal)
cd frontend
npm install
npx expo start
```

---

## Testing OAuth

### Test Google Sign In
1. Run the app on a physical device or emulator
2. Tap "Continue with Google"
3. Complete the Google sign-in flow
4. Verify user is created in MongoDB

### Test Apple Sign In (iOS only)
1. Run on iOS simulator or physical device
2. Tap "Continue with Apple"
3. Complete the Apple sign-in flow
4. Verify user is created in MongoDB

---

## Troubleshooting

### MongoDB Connection Failed
- Ensure MongoDB is running: `mongod`
- Check the `MONGO_URI` in `.env`

### Google Auth Error
- Verify `GOOGLE_CLIENT_ID` matches your OAuth client
- Ensure the OAuth consent screen is configured
- Check that the correct SHA-1 fingerprint is added for Android

### Apple Auth Error
- Ensure you're testing on a real iOS device or simulator
- Verify the `.p8` key file path is correct
- Check that Sign In with Apple is enabled in your App ID

### Cloudinary Upload Failed
- Verify all three Cloudinary credentials are correct
- Check your Cloudinary usage limits
