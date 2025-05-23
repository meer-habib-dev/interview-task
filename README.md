# PerDiem Scheduling App

A React Native Expo application for scheduling appointments with features like Google Authentication, push notifications, and timezone management.

## Features

- **Authentication**
  - Email/Password login
  - Google Authentication
  - Persistent login state

- **Store Hours Management**
  - View store status (open/closed)
  - Date selection with dynamic time slots
  - Override handling for special dates

- **Timezone Toggle**
  - Switch between NYC timezone and local timezone
  - Dynamic greeting messages based on time of day
  - Location detection for city name

- **State Management**
  - Zustand for global state management
  - MMKV for persistent storage
  - React Query for API data fetching

- **Notifications**
  - Push notifications for store opening times
  - Permission handling

## Setup and Run Instructions

### Prerequisites

- Node.js (v14 or newer)
- Yarn or npm
- Expo CLI (`npm install -g expo-cli`)

### Installation

1. Clone the repository
```
git clone https://github.com/your-username/perdiem-scheduler.git
cd perdiem-scheduler
```

2. Install dependencies
```
npm install
```

3. Start the development server
```
npm run dev
```

4. Open the app
   - iOS: Press `i` in the terminal or open the iOS simulator
   - Android: Press `a` in the terminal or open the Android emulator
   - Web: Press `w` in the terminal or open http://localhost:19006

### Environment Variables

Create a `.env` file in the root directory with:

```
EXPO_PUBLIC_API_URL=https://coding-challenge-pd-1a25b1a14f34.herokuapp.com
EXPO_PUBLIC_FIREBASE_API_KEY=your-firebase-api-key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your-firebase-auth-domain
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your-firebase-project-id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your-firebase-storage-bucket
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-firebase-messaging-sender-id
EXPO_PUBLIC_FIREBASE_APP_ID=your-firebase-app-id
```

### Firebase Setup for React Native

This project uses @react-native-firebase/app and @react-native-firebase/auth for authentication.

#### iOS Setup
1. Create a Firebase project and register your iOS app in the Firebase console
2. Download the `GoogleService-Info.plist` file and place it in the root directory of your project
3. Run `npx expo prebuild` to generate the native iOS project
4. Build and run on iOS with `npx expo run:ios`

#### Android Setup
1. Create a Firebase project and register your Android app in the Firebase console
2. Download the `google-services.json` file and place it in the root directory of your project
3. Run `npx expo prebuild` to generate the native Android project
4. Build and run on Android with `npx expo run:android`

## API Integration

The app integrates with a mock API for store hours and overrides:
- Base URL: https://coding-challenge-pd-1a25b1a14f34.herokuapp.com
- Authentication: Basic Authentication (username: perdiem, password: perdiem)
- Endpoints:
  - `/store-times` - Regular store opening and closing hours by day of week
  - `/store-overrides` - Special opening/closing times for specific dates
  - `/auth` - Authentication endpoint for email/password login

## Architecture

The app follows a modular architecture with:

- **Screens**: Main UI screens (Login, Home, Profile, Settings)
- **Components**: Reusable UI components
- **Services**: API and auth services
- **Store**: Zustand state management
- **Utils**: Helper functions for dates, notifications, etc.
- **Types**: TypeScript type definitions

## Limitations

- Push notifications are not supported in web browsers
- Location services have limited functionality on web
- Google Authentication requires proper setup in the Google Cloud Console

## Notes on Approach

- Used React Query for efficient API data fetching and caching
- Implemented persistent storage with MMKV for better performance
- Created a responsive UI that works well on various device sizes
- Used Zustand for simple but powerful state management
- Focused on user experience with smooth animations and clear feedback