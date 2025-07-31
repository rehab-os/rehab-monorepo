# Firebase Authentication Migration Guide

This guide outlines the migration from Supabase to Firebase for phone OTP authentication in the rehab monorepo.

## Overview

The authentication system has been migrated from Supabase to Firebase while maintaining custom JWT tokens for API authentication. The flow now works as follows:

1. **Frontend**: Firebase handles phone OTP verification and provides ID tokens
2. **Backend**: Verifies Firebase ID tokens and issues custom JWT tokens
3. **API Authentication**: Uses custom JWT tokens for all subsequent requests

## Required Firebase Setup

### 1. Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or use the existing "healui" project
3. Enable Authentication > Sign-in method > Phone

### 2. Download Service Account Key

1. Go to Project Settings > Service Accounts
2. Click "Generate new private key"
3. Download the JSON file
4. Extract the values for environment variables

### 3. Web App Configuration

1. Go to Project Settings > Your apps
2. Add a web app or use existing configuration
3. Copy the config object

## Environment Variables

Update your `.env` file with the following Firebase configuration:

```bash
# Firebase Configuration
FIREBASE_PROJECT_ID=healui
FIREBASE_PRIVATE_KEY_ID=your_private_key_id_here
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nyour_private_key_here\n-----END PRIVATE KEY-----"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@healui.iam.gserviceaccount.com
FIREBASE_CLIENT_ID=your_client_id_here
FIREBASE_AUTH_URI=https://accounts.google.com/o/oauth2/auth
FIREBASE_TOKEN_URI=https://oauth2.googleapis.com/token
FIREBASE_AUTH_PROVIDER_X509_CERT_URL=https://www.googleapis.com/oauth2/v1/certs
FIREBASE_CLIENT_X509_CERT_URL=https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-xxxxx%40healui.iam.gserviceaccount.com
FIREBASE_UNIVERSE_DOMAIN=googleapis.com

# JWT (Keep existing)
JWT_SECRET=your_jwt_secret_here

# Database (Keep existing)
DATABASE_HOST=localhost
DATABASE_PORT=5434
DATABASE_USER=postgres
DATABASE_PASSWORD=rehab-password
DATABASE_NAME=clinic_management
```

## File Changes Summary

### Backend Changes

1. **New Files**:
   - `libs/backend/database/src/lib/config/firebase.config.ts`
   - `libs/backend/common/src/lib/services/firebase.service.ts`

2. **Modified Files**:
   - `apps/backend/core-api/src/app/services/auth.service.ts` - Updated to use Firebase
   - `apps/backend/core-api/src/app/app.module.ts` - Added Firebase service
   - `libs/backend/common/src/lib/dto/login.dto.ts` - Added firebaseIdToken field
   - `libs/backend/common/src/index.ts` - Export Firebase service

### Frontend Web Changes

1. **New Files**:
   - `apps/web/clinic/src/services/firebase-auth.ts`

2. **Modified Files**:
   - `apps/web/clinic/credentials.ts` - Updated Firebase imports
   - `apps/web/clinic/src/app/login/page.tsx` - Firebase authentication
   - `libs/frontend/shared/src/lib/types/index.ts` - Updated LoginDto

### Mobile App Changes

1. **New Files**:
   - `apps/mobile/clinic/src/services/firebase-config.ts`
   - `apps/mobile/clinic/src/services/firebase-auth.ts`

2. **Modified Files**:
   - `apps/mobile/clinic/src/screens/auth/LoginScreen.tsx` - Firebase authentication
   - `apps/mobile/clinic/src/screens/auth/OTPVerificationScreen.tsx` - Firebase verification
   - `apps/mobile/clinic/src/services/api/ApiManager.ts` - Updated login method
   - `apps/mobile/clinic/package.json` - Added Firebase dependency

## Authentication Flow

### Previous Flow (Supabase)
1. Frontend sends phone number to backend
2. Backend calls Supabase to send OTP
3. Frontend sends phone + OTP to backend
4. Backend verifies OTP with Supabase
5. Backend issues custom JWT

### New Flow (Firebase)
1. Frontend directly calls Firebase to send OTP
2. Frontend verifies OTP with Firebase, gets ID token
3. Frontend sends phone + Firebase ID token to backend
4. Backend verifies Firebase ID token
5. Backend issues custom JWT

## Testing

### Prerequisites
1. Ensure Firebase project is configured correctly
2. Update environment variables
3. Install dependencies: `npm install`

### Test Steps
1. Start backend: `npm run serve` (in apps/backend/core-api)
2. Start web frontend: `npm run dev` (in apps/web/clinic)
3. Test login flow:
   - Enter phone number
   - Verify Firebase sends OTP
   - Enter OTP
   - Verify successful login

### Mobile Testing
1. Run React Native app: `npm run start` (in apps/mobile/clinic)
2. Test on device/simulator with valid phone number
3. Verify OTP flow works correctly

## Rollback Plan

If issues occur, you can temporarily rollback by:

1. Commenting out Firebase service in `app.module.ts`
2. Reverting `auth.service.ts` to use Supabase
3. Updating frontend to use old flow
4. Re-enabling Supabase environment variables

## Security Considerations

1. **Firebase ID Tokens**: These are verified server-side for authenticity
2. **Custom JWTs**: Continue to be used for API authentication
3. **Phone Verification**: Firebase handles the actual SMS sending and verification
4. **Token Expiry**: Firebase ID tokens are short-lived; custom JWTs have configurable expiry

## Production Deployment

1. Ensure Firebase project is in production mode
2. Update Firebase configuration for production domain
3. Set up proper CORS policies
4. Monitor authentication metrics in Firebase Console
5. Set up Firebase security rules if using other Firebase services

## Support

For issues related to:
- Firebase Configuration: Check Firebase Console > Authentication
- Backend Integration: Review logs in core-api service
- Frontend Issues: Check browser console for Firebase errors
- Mobile Issues: Check React Native debugger and device logs