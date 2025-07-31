import { auth } from './firebase-config';
import firebase from 'firebase/compat/app';

export interface FirebaseAuthService {
  sendOTP: (phoneNumber: string) => Promise<firebase.auth.ConfirmationResult>;
  verifyOTP: (confirmationResult: firebase.auth.ConfirmationResult, code: string) => Promise<string>;
  signOut: () => Promise<void>;
  getCurrentUserIdToken: () => Promise<string | null>;
}

class FirebaseAuthServiceImpl implements FirebaseAuthService {
  /**
   * Send OTP to phone number
   */
  async sendOTP(phoneNumber: string): Promise<firebase.auth.ConfirmationResult> {
    try {
      const confirmationResult = await auth.signInWithPhoneNumber(phoneNumber);
      return confirmationResult;
    } catch (error: any) {
      console.error('Error sending OTP:', error);
      throw new Error(error.message || 'Failed to send OTP');
    }
  }

  /**
   * Verify OTP and get Firebase ID token
   */
  async verifyOTP(confirmationResult: firebase.auth.ConfirmationResult, code: string): Promise<string> {
    try {
      const credential = await confirmationResult.confirm(code);
      const idToken = await credential.user?.getIdToken();
      
      if (!idToken) {
        throw new Error('Failed to get ID token');
      }
      
      return idToken;
    } catch (error: any) {
      console.error('Error verifying OTP:', error);
      if (error.code === 'auth/invalid-verification-code') {
        throw new Error('Invalid OTP. Please try again.');
      } else if (error.code === 'auth/code-expired') {
        throw new Error('OTP has expired. Please request a new one.');
      }
      throw new Error(error.message || 'Failed to verify OTP');
    }
  }

  /**
   * Sign out user
   */
  async signOut(): Promise<void> {
    try {
      await auth.signOut();
    } catch (error: any) {
      console.error('Error signing out:', error);
      throw new Error(error.message || 'Failed to sign out');
    }
  }

  /**
   * Get current user's ID token
   */
  async getCurrentUserIdToken(): Promise<string | null> {
    try {
      const user = auth.currentUser;
      if (user) {
        return await user.getIdToken();
      }
      return null;
    } catch (error: any) {
      console.error('Error getting ID token:', error);
      return null;
    }
  }
}

export const firebaseAuthService = new FirebaseAuthServiceImpl();
export default firebaseAuthService;