import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

export const API_CONFIG = {
  BASE_URL: Platform.select({
    ios: 'http://localhost:3002/api/v1/',
    android: 'http://10.0.2.2:3002/api/v1/',
    default: 'http://localhost:3002/api/v1/',
  }),
  TIMEOUT: 30000,
  RETRY_COUNT: 3,
};

export const STORAGE_KEYS = {
  ACCESS_TOKEN: '@rehab_access_token',
  REFRESH_TOKEN: '@rehab_refresh_token',
  USER_DATA: '@rehab_user_data',
  CLINIC_DATA: '@rehab_clinic_data',
};

export const getAuthToken = async () => {
  try {
    return await AsyncStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
  } catch (error) {
    console.error('Error getting auth token:', error);
    return null;
  }
};

export const setAuthTokens = async (accessToken: string, refreshToken: string) => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken);
    await AsyncStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
  } catch (error) {
    console.error('Error setting auth tokens:', error);
  }
};

export const clearAuthTokens = async () => {
  try {
    await AsyncStorage.multiRemove([
      STORAGE_KEYS.ACCESS_TOKEN,
      STORAGE_KEYS.REFRESH_TOKEN,
    ]);
  } catch (error) {
    console.error('Error clearing auth tokens:', error);
  }
};