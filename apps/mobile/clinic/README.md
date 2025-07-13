# RehabClinic Mobile App

A React Native mobile application for physiotherapists to manage their clinic operations on-the-go.

## Features

- 🔐 **Secure Authentication** - OTP-based login system
- 📊 **Dashboard** - Quick overview of daily statistics and appointments
- 👥 **Patient Management** - Search, view, and manage patient records
- 📅 **Appointment Scheduling** - Calendar view with time slots and status tracking
- 👨‍⚕️ **Profile Management** - User settings and preferences
- 🎨 **Minimalistic Design** - Clean, doctor-friendly interface optimized for mobile

## Tech Stack

- **React Native 0.76** - Cross-platform mobile framework
- **React Navigation 6** - Navigation and routing
- **React Native Paper** - Material Design components
- **React Native Reanimated 3** - Smooth animations
- **Redux Toolkit** - State management
- **React Query** - Data fetching and caching
- **Axios** - HTTP client
- **TypeScript** - Type safety

## Setup Instructions

### Prerequisites

- Node.js 18+
- React Native CLI
- Android Studio (for Android development)
- Xcode (for iOS development on macOS)

### Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **iOS Setup (macOS only):**
   ```bash
   cd ios
   pod install
   cd ..
   ```

3. **Start Metro bundler:**
   ```bash
   npm start
   ```

4. **Run on device/simulator:**
   ```bash
   # Android
   npm run android
   
   # iOS
   npm run ios
   ```

## API Configuration

The app is configured to connect to your backend API:

- **iOS Simulator:** `http://localhost:3002/api/v1/`
- **Android Emulator:** `http://10.0.2.2:3002/api/v1/`

Update the API configuration in `src/services/api/config.ts` if your backend runs on a different port or host.

## Project Structure

```
src/
├── app/                    # Main app component
├── components/             # Reusable UI components
│   ├── navigation/         # Navigation components
│   └── ui/                 # UI components
├── screens/               # Screen components
│   ├── auth/              # Authentication screens
│   └── main/              # Main app screens
├── services/              # API and external services
│   └── api/               # API client and methods
├── store/                 # Redux store and slices
├── theme/                 # Design system (colors, typography, spacing)
└── utils/                 # Utility functions
```

## Key Features Details

### Authentication Flow
- Phone number validation
- OTP verification with auto-focus and auto-submit
- Secure token storage using AsyncStorage
- Automatic token refresh

### Dashboard
- Daily statistics overview
- Today's appointments preview
- Quick action buttons
- Responsive grid layout

### Patient Management
- Searchable patient list
- Patient status indicators
- Contact integration
- Smooth animations

### Appointments
- Calendar view with date selection
- Time slot management
- Status tracking (scheduled, in-progress, completed, cancelled)
- Section-based organization

### Design System
- Material Design 3 theming
- Consistent spacing system
- Typography scale
- Color palette optimized for medical apps
- Haptic feedback for better UX

## Development Notes

- The app uses the same API endpoints as the web application
- Redux store structure mirrors the web app for consistency
- All screens are responsive and work on various screen sizes
- Haptic feedback uses React Native's built-in Vibration API
- Animations are powered by React Native Reanimated for smooth performance

## Testing

```bash
# Run tests
npm test

# Run type checking
npx tsc --noEmit
```

## Contributing

1. Follow the existing code style and structure
2. Use TypeScript for all new components
3. Ensure responsive design for different screen sizes
4. Test on both iOS and Android platforms
5. Add appropriate error handling and loading states