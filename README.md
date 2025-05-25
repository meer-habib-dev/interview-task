# PerDiem Scheduling App

A React Native Expo application for scheduling appointments with features like Google Authentication, push notifications, and timezone management.

## 📱 App Demo

<img src="./assets/images/demo.gif" alt="App Demo" width="390">

*Demo showing the main features of the PerDiem Scheduling App*

## 🎥 Video Demo

Watch the full app demonstration: [Video Demo](https://drive.google.com/file/d/1c8paacR9CsR24QaJoolw6Rp_4IXOfPWk/view?usp=sharing)

## ✨ Features

- **Authentication**
  - Email/Password login
  - Google Authentication with Firebase
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

## 🚀 Setup and Run Instructions

### Prerequisites

- Node.js (v18.20.2)
- npm or yarn
- Expo CLI: `npm install -g @expo/cli`
- iOS Simulator (for iOS development)
- Android Studio/Emulator (for Android development)

### Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/meer-habib-dev/interview-task.git
   cd interview-task
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Run on your preferred platform**
   - **iOS**: Press `i` in the terminal or scan QR code with Expo Go
   - **Android**: Press `a` in the terminal or scan QR code with Expo Go
   - **Web**: Press `w` in the terminal

### Firebase Setup (Required for Authentication)

The app uses Firebase for Google Authentication. Firebase configuration files are already included:

- `GoogleService-Info.plist` (iOS)
- `google-services.json` (Android)

For production deployment, you'll need to:
1. Create your own Firebase project
2. Replace the configuration files with your own
3. Update the bundle identifiers in `app.json`

### Building for Production

For iOS/Android builds:
```bash
# Generate native code
npx expo prebuild

# Build for iOS
npx expo run:ios

# Build for Android
npx expo run:android
```

## 📋 Available Scripts

- `npm run dev` - Start development server
- `npm run android` - Run on Android
- `npm run ios` - Run on iOS
- `npm run build:web` - Build for web
- `npm run lint` - Run linter

## 🏗️ Architecture

```
├── app/                    # Expo Router pages
│   ├── (auth)/            # Authentication screens
│   ├── (tabs)/            # Main tab navigation
│   └── _layout.tsx        # Root layout
├── components/            # Reusable UI components
├── screens/               # Screen components
├── services/              # API services
├── store/                 # Zustand state management
├── utils/                 # Helper functions
├── types/                 # TypeScript definitions
└── constants/             # App constants
```

## 🔧 API Integration

The app integrates with a mock API:

- **Base URL**: `https://coding-challenge-pd-1a25b1a14f34.herokuapp.com`
- **Authentication**: Basic Auth (username: `perdiem`, password: `perdiem`)
- **Endpoints**:
  - `/store-times` - Regular store hours by day
  - `/store-overrides` - Special dates with custom hours
- **Web Platform**: 
  - Push notifications not supported in browsers
  - Location services have limited functionality
  - Google Sign-In requires additional web configuration
- **Authentication**: 
  - Requires proper Firebase setup for production use
  - Google Sign-In needs Google Cloud Console configuration
- **Notifications**: 
  - Limited to foreground notifications on some platforms
  - Requires user permission
- **Timezone**: 
  - Location detection may not work in all environments
  - Fallback to device timezone when location unavailable

## 📝 Notes on Approach

### Technical Decisions

1. **Expo Router**: Chosen for file-based routing and better developer experience
2. **Zustand**: Lightweight state management, easier than Redux for this scope
3. **React Query**: Efficient API data fetching with caching and background updates
4. **MMKV**: High-performance storage for persistent data
5. **Firebase Auth**: Reliable authentication with Google Sign-In support

### Code Organization

- **Modular Architecture**: Clear separation of concerns
- **TypeScript**: Full type safety throughout the application
- **Consistent Styling**: Centralized theme and color constants
- **Error Boundaries**: Graceful error handling and recovery
- **Performance**: Optimized re-renders and efficient data fetching


## 🔗 Links

- **Repository**: [GitHub](https://github.com/meer-habib-dev/interview-task)
- **Video Demo**: [Google Drive](https://drive.google.com/file/d/1c8paacR9CsR24QaJoolw6Rp_4IXOfPWk/view?usp=sharing)
